'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../public/game.js'), 'utf8');
const handlers = html.slice(html.indexOf('let pendingLeave = false;'), html.indexOf('// ── Helpers'));

function harness() {
  const listeners = {};
  const sent = [];
  const elements = Object.fromEntries(['connection-overlay', 'connection-message', 'typing-input'].map(id => [id, { hidden: true, disabled: false, focus() {} }]));
  const state = { myId: 'same-id', roomCode: 'ABC123', isRacing: true, finished: false,
    wordIndex: 4, wordTimings: [{ word: 'hello', ms: 100 }], correctChars: 22, startTime: 1000 };
  let returned = false;
  const socket = { connected: true, recovered: true, id: 'same-id',
    on(event, callback) { listeners[event] = callback; }, emit(...args) { sent.push(args); } };
  const context = vm.createContext({ state, socket, document: { getElementById(id) { return elements[id]; } },
    showToast() {}, renderWaiting() {}, showScreen() {},
    goLobby() { returned = true; state.roomCode = null; } });
  vm.runInContext(handlers, context);
  return { state, socket, listeners, sent, elements, context, get returned() { return returned; } };
}

test('disconnect disables input and refuses to buffer gameplay actions', () => {
  const h = harness();
  h.socket.connected = false;
  h.listeners.disconnect();
  assert.equal(h.elements['connection-overlay'].hidden, false);
  assert.equal(h.elements['typing-input'].disabled, true);
  h.socket.emit('player:finished', { wpm: 50 });
  assert.equal(h.sent.length, 0);
});

test('recovery enables input without resetting word progress or race timing', () => {
  const h = harness();
  h.socket.connected = false;
  h.listeners.disconnect();
  h.socket.connected = true;
  h.listeners.connect();
  h.listeners['room:resumed']({ state: 'racing', hostId: 'host', players: [{ id: 'same-id' }] });
  assert.equal(h.elements['connection-overlay'].hidden, true);
  assert.equal(h.elements['typing-input'].disabled, false);
  assert.equal(h.state.wordIndex, 4);
  assert.equal(h.state.correctChars, 22);
  assert.equal(h.state.startTime, 1000);
  assert.equal(h.state.wordTimings.length, 1);
});

test('an unrecoverable connection returns to the lobby', () => {
  const h = harness();
  h.socket.recovered = false;
  h.listeners.connect();
  assert.equal(h.returned, true);
  assert.equal(h.state.roomCode, null);
});

test('leaving while offline skips restoration and sends the leave after reconnect', () => {
  const h = harness();
  vm.runInContext('pendingLeave = true; state.roomCode = null;', h.context);
  h.listeners['room:resumed']({ state: 'racing', players: [{ id: 'same-id' }] });
  h.listeners.connect();
  assert.deepEqual(h.sent, [['room:leave']]);
  assert.equal(h.state.roomCode, null);
});
