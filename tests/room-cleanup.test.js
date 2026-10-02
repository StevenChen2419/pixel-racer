'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../server/index.js'), 'utf8');
const cleanup = source.slice(source.indexOf('function leaveRoom(socket)'), source.indexOf('// ── Socket.IO connection handler'));

for (const connected of [true, false]) {
  test(`departure ${connected ? 'starts a race for ready players' : 'does not start while another player is disconnected'}`, () => {
    const room = { code: 'ABC123', state: 'waiting', hostId: 'host',
      players: new Map([['host', { id: 'host' }], ['guest', { id: 'guest', ready: true, connected }]]),
      spectators: new Set(), modOwners: { easy_quote: 'host' }, rematchVotes: new Set(['host']) };
    let started = false;
    const socket = { id: 'host', data: { roomCode: room.code }, leave() {} };
    const context = vm.createContext({ rooms: { [room.code]: room }, disconnectedPlayers: new Map(),
      clearTimeout() {}, clearInterval() {}, removeBots() {}, broadcastRoom() {}, allRacersDone() { return false; },
      startCountdown(r) { started = true; r.state = 'countdown'; }, endRace() {},
      io: { to() { return { emit() {} }; }, sockets: { sockets: new Map() } } });
    vm.runInContext(cleanup, context);
    context.leaveRoom(socket);
    assert.equal(room.players.size, 1);
    assert.equal(room.hostId, 'guest');
    assert.equal(room.rematchVotes.size, 0);
    assert.equal(Object.keys(room.modOwners).length, 0);
    assert.equal(socket.data.roomCode, undefined);
    assert.equal(started, connected);
  });
}
