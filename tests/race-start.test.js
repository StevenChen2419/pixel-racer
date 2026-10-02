'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { normalizeTypingText } = require('../public/typing-text');

// Exercise the actual race-start functions without opening ports or calling AI.
const source = fs.readFileSync(path.join(__dirname, '../server/index.js'), 'utf8');
const raceSource = source.slice(source.indexOf('async function startCountdown('), source.indexOf('function endRace('));

function harness(pickQuote) {
  const room = { code: 'ABC123', state: 'waiting', quoteCategory: 'science', useAI: true,
    activeMods: ['easy_quote'], startTime: null, pendingQuote: null };
  const events = [];
  let tick;
  let now = 1000;
  const context = vm.createContext({
    rooms: { [room.code]: room }, pickQuote, normalizeTypingText,
    maybeAddBots() {}, broadcastRoom(r) { events.push({ name: 'room:update', state: r.state }); },
    io: { to() { return { emit(name, data) { events.push({ name, data }); } }; } },
    setInterval(fn) { tick = fn; return 1; }, clearInterval() {},
    setTimeout() { return 2; }, startBots() {}, endRace() {},
    Date: { now() { return now; } },
  });
  vm.runInContext(raceSource, context);
  return { room, context, events, tick() { now += 1000; tick(); } };
}

test('slow preparation uses one quote and starts the clock after a full countdown', async () => {
  let resolveQuote;
  let calls = 0;
  const h = harness((category, useAI, difficulty) => {
    calls++;
    assert.equal(category, 'science');
    assert.equal(useAI, true);
    assert.equal(difficulty, 'easy');
    return new Promise(resolve => { resolveQuote = resolve; });
  });
  const preparing = h.context.startCountdown(h.room);
  assert.equal(h.room.state, 'countdown');
  assert.equal(h.room.startTime, null);
  assert.equal(h.events.filter(e => e.name === 'countdown:tick').length, 0);
  await h.context.startCountdown(h.room); // Duplicate ready must not start another request.
  assert.equal(calls, 1);
  resolveQuote({ text: 'A shared passage.', source: 'Test', isAI: true });
  await preparing;
  assert.equal(h.events.at(-1).data.count, 3);
  h.tick(); h.tick();
  assert.equal(h.room.startTime, null);
  h.tick();
  assert.equal(h.room.state, 'racing');
  assert.equal(h.room.startTime, 4000);
  assert.equal(h.room.prompt, 'A shared passage.');
  assert.equal(calls, 1);
  assert.equal(h.events.filter(e => e.name === 'countdown:go').length, 1);
  h.context.startRace(h.room);
  assert.equal(h.events.filter(e => e.name === 'countdown:go').length, 1);
});

test('a disconnected room cannot resume after quote preparation', async () => {
  let resolveQuote;
  const h = harness(() => new Promise(resolve => { resolveQuote = resolve; }));
  const preparing = h.context.startCountdown(h.room);
  delete h.context.rooms[h.room.code];
  resolveQuote({ text: 'A discarded passage.' });
  await preparing;
  assert.equal(h.room.startTime, null);
  assert.equal(h.events.filter(e => e.name === 'countdown:tick').length, 0);
});

test('a fallback quote follows the same countdown and start timing', async () => {
  const h = harness(async () => ({ text: 'A built-in fallback.', source: 'Library' }));
  await h.context.startCountdown(h.room);
  h.tick(); h.tick(); h.tick();
  assert.equal(h.room.state, 'racing');
  assert.equal(h.room.prompt, 'A built-in fallback.');
  assert.equal(h.room.promptIsAI, false);
  assert.equal(h.room.startTime, 4000);
});
