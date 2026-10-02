'use strict';

function startFinishWindow(room, { emit, endRace, now = Date.now, setTimer = setTimeout, clearTimer = clearTimeout }) {
  if (room.state !== 'racing' || room.finishWindowStarted) return;
  room.finishWindowStarted = true;
  room.raceEndAt = Math.min(room.raceEndAt, now() + 30000);
  clearTimer(room.raceTimer);
  const remainingMs = Math.max(0, room.raceEndAt - now());
  room.raceTimer = setTimer(() => { if (room.state === 'racing') endRace(room); }, remainingMs);
  emit('race:deadline', { remainingMs, firstFinished: true });
}

function giveUpPlayer(room, player) {
  if (room.state !== 'racing' || !player || player.isBot || player.finishTime || player.gaveUp) return false;
  player.gaveUp = true;
  player.coins = 0;
  return true;
}

function allRacersDone(room) {
  return Array.from(room.players.values()).every(p => p.finishTime || p.gaveUp);
}

module.exports = { startFinishWindow, giveUpPlayer, allRacersDone };
