'use strict';

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function inRange(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

// A bounded fixed-window store. Exhaustion fails closed rather than evicting
// active clients and accidentally resetting their quotas.
function createLimiter(maxKeys = 10000, now = Date.now) {
  const records = new Map();
  function prune() {
    const time = now();
    for (const [key, record] of records) if (record.resetAt <= time) records.delete(key);
  }
  const timer = setInterval(prune, 60000);
  timer.unref();
  return {
    consume(key, max, windowMs = 60000) {
      const time = now();
      let record = records.get(key);
      if (!record || record.resetAt <= time) {
        if (!record && records.size >= maxKeys) prune();
        if (!record && records.size >= maxKeys) return { allowed: false, retryAfter: 60 };
        record = { count: 0, resetAt: time + windowMs };
        records.set(key, record);
      }
      record.count++;
      return { allowed: record.count <= max, retryAfter: Math.max(1, Math.ceil((record.resetAt - time) / 1000)) };
    },
    close() { clearInterval(timer); },
  };
}

function originAllowed(req, configuredOrigin, production) {
  const origin = req.headers.origin;
  if (origin === undefined) return req.headers['sec-fetch-site'] !== 'cross-site';
  if (typeof origin !== 'string' || origin === 'null') return false;
  if (production) return origin === configuredOrigin;
  // Development also supports opening the game on a local network address.
  try {
    const url = new URL(origin);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === origin
      && url.host === req.headers.host;
  } catch { return false; }
}

function validAnalysis(body) {
  return isRecord(body) && typeof body.prompt === 'string' && body.prompt.trim().length > 0
    && body.prompt.length <= 1000 && inRange(body.wpm, 0, 500)
    && inRange(body.accuracy, 0, 100) && Number.isInteger(body.errors) && inRange(body.errors, 0, 100000)
    && inRange(body.totalTime, 0, 3600) && Array.isArray(body.wordTimings) && body.wordTimings.length <= 200
    && body.wordTimings.every(w => isRecord(w) && typeof w.word === 'string'
      && w.word.length > 0 && w.word.length <= 100 && inRange(w.ms, 0, 3600000));
}

module.exports = { isRecord, inRange, createLimiter, originAllowed, validAnalysis };
