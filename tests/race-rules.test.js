'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { startFinishWindow, giveUpPlayer, allRacersDone } = require('../server/race-rules');

function clock() {
  let callback;
  let duration;
  let cleared;
  let ended = 0;
  const events = [];
  return { options: {
    now: () => 10000,
    setTimer(fn, ms) { callback = fn; duration = ms; return 2; },
    clearTimer(timer) { cleared = timer; },
    emit(event, payload) { events.push({ event, payload }); },
    endRace() { ended++; },
  }, events, fire() { callback(); },
  get duration() { return duration; }, get cleared() { return cleared; }, get ended() { return ended; } };
}

test('first finish replaces the hard limit with a 30-second window; later finishers do not extend it', () => {
  const c = clock();
  const room = { state: 'racing', raceEndAt: 300000, raceTimer: 1 };
  startFinishWindow(room, c.options);
  assert.equal(c.duration, 30000);
  assert.equal(c.cleared, 1);
  assert.equal(room.raceEndAt, 40000);
  startFinishWindow(room, c.options);
  assert.equal(c.events.length, 1);
  c.fire();
  assert.equal(c.ended, 1);
});

test('finishing close to the hard limit does not extend the race', () => {
  const c = clock();
  const room = { state: 'racing', raceEndAt: 15000, raceTimer: 1 };
  startFinishWindow(room, c.options);
  assert.equal(c.duration, 5000);
  room.state = 'finished';
  c.fire();
  assert.equal(c.ended, 0);
});

test('giving up counts as done without becoming a finisher or earning coins', () => {
  const player = { progress: 55, wpm: 40, finishTime: null, coins: 100 };
  const room = { state: 'racing', players: new Map([['p', player], ['bot', { isBot: true, finishTime: 123 }]]) };
  assert.equal(giveUpPlayer(room, player), true);
  assert.equal(player.finishTime, null);
  assert.equal(player.progress, 55);
  assert.equal(player.coins, 0);
  assert.equal(allRacersDone(room), true);
  assert.equal(giveUpPlayer(room, player), false);
});

test('giving up is rejected outside a race, for spectators, bots, and completed racers', () => {
  assert.equal(giveUpPlayer({ state: 'waiting' }, {}), false);
  assert.equal(giveUpPlayer({ state: 'racing' }, undefined), false);
  assert.equal(giveUpPlayer({ state: 'racing' }, { isBot: true }), false);
  assert.equal(giveUpPlayer({ state: 'racing' }, { finishTime: 123 }), false);
  assert.equal(allRacersDone({ players: new Map([['p', { progress: 30 }]]) }), false);
});
