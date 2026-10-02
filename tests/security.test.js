'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const fs = require('node:fs');
const { isRecord, inRange, createLimiter, originAllowed, validAnalysis } = require('../server/security');
const root = path.join(__dirname, '..');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

test('validation rejects non-finite numbers and malformed analysis records', () => {
  const valid = { prompt: 'Hello world', wpm: 50, accuracy: 99, errors: 2,
    totalTime: 4, wordTimings: [{ word: 'Hello', ms: 200 }] };
  assert.equal(validAnalysis(valid), true);
  for (const value of [null, [], 'text']) assert.equal(isRecord(value), false);
  for (const value of [NaN, Infinity, -Infinity, '50', null]) assert.equal(inRange(value, 0, 500), false);
  for (const field of ['wpm', 'accuracy', 'errors', 'totalTime']) {
    assert.equal(validAnalysis({ ...valid, [field]: Infinity }), false);
    assert.equal(validAnalysis({ ...valid, [field]: '50' }), false);
  }
  assert.equal(validAnalysis({ ...valid, wordTimings: [null] }), false);
  assert.equal(validAnalysis({ ...valid, wordTimings: [{ word: 'hi', ms: -1 }] }), false);
});

test('rate limits keep scopes separate and fail closed at bounded capacity', () => {
  let now = 0;
  const limiter = createLimiter(2, () => now);
  try {
    assert.equal(limiter.consume('rooms:ip', 1).allowed, true);
    assert.equal(limiter.consume('rooms:ip', 1).allowed, false);
    assert.equal(limiter.consume('analysis:ip', 1).allowed, true);
    assert.equal(limiter.consume('new-ip', 1).allowed, false);
    now = 60000;
    assert.equal(limiter.consume('new-ip', 1).allowed, true);
  } finally { limiter.close(); }
});

test('origin checks allow the game and reject foreign, null, and cross-site origins', () => {
  const request = headers => ({ headers: { host: 'localhost:3000', ...headers } });
  assert.equal(originAllowed(request({ origin: 'http://localhost:3000' }), '', false), true);
  assert.equal(originAllowed(request({ origin: 'https://evil.example' }), '', false), false);
  assert.equal(originAllowed(request({ origin: 'null' }), '', false), false);
  assert.equal(originAllowed(request({ 'sec-fetch-site': 'cross-site' }), '', false), false);
  assert.equal(originAllowed(request({ origin: 'https://game.example' }), 'https://game.example', true), true);
  assert.equal(originAllowed(request({ origin: 'https://game.example.evil.test' }), 'https://game.example', true), false);
});

test('production refuses missing or insecure origin configuration', () => {
  for (const origin of ['', 'http://game.example', 'https://game.example/path']) {
    const result = spawnSync(process.execPath, ['server/index.js'], {
      cwd: root, env: { ...process.env, NODE_ENV: 'production', ALLOWED_ORIGIN: origin, GROQ_API_KEY: '' }, timeout: 5000,
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr.toString(), /ALLOWED_ORIGIN/);
  }
});

test('HTML cannot execute inline scripts or handler attributes', () => {
  const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
  assert.doesNotMatch(html, /<script\s*>|\son(?:click|input|change)\s*=/i);
  assert.match(html, /src="\/game.js"/);
  assert.match(html, /src="\/ui-events.js"/);
});

async function connect(port) {
  const ws = new WebSocket(`ws://localhost:${port}/socket.io/?EIO=4&transport=websocket`);
  const client = { ws, queue: [], id: null };
  ws.onmessage = ({ data }) => {
    const packet = String(data);
    if (packet.startsWith('0')) ws.send('40');
    else if (packet === '2') ws.send('3');
    else if (packet.startsWith('40')) client.id = JSON.parse(packet.slice(2)).sid;
    else if (packet.startsWith('42')) client.queue.push(JSON.parse(packet.slice(2)));
  };
  client.emit = (event, data) => ws.send('42' + JSON.stringify(data === undefined ? [event] : [event, data]));
  client.wait = async (event, predicate = () => true) => {
    for (let i = 0; i < 200; i++) {
      const index = client.queue.findIndex(args => args[0] === event && predicate(args[1]));
      if (index !== -1) return client.queue.splice(index, 1)[0][1];
      await sleep(20);
    }
    throw Error('Timed out: ' + event);
  };
  for (let i = 0; !client.id && i < 100; i++) await sleep(20);
  assert.ok(client.id);
  return client;
}

test('HTTP and multiplayer security integration', { timeout: 20000 }, async t => {
  const reservation = net.createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const server = spawn(process.execPath, ['server/index.js'], { cwd: root,
    env: { ...process.env, PORT: String(port), NODE_ENV: 'development', ALLOWED_ORIGIN: `http://localhost:${port}`, TRUSTED_PROXIES: '', GROQ_API_KEY: '' }, stdio: 'ignore' });
  const clients = [];
  t.after(() => { for (const c of clients) c.ws.close(); server.kill(); });
  const base = `http://localhost:${port}`;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    await sleep(30);
  }

  await t.test('headers, body limits, generic errors, and HTTP origins', async () => {
    const res = await fetch(base);
    assert.equal(res.headers.get('x-powered-by'), null);
    const csp = res.headers.get('content-security-policy');
    assert.match(csp, /script-src 'self';/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.doesNotMatch(csp, /connect-src[^;]* ws: |script-src[^;]*unsafe/);
    const post = body => fetch(base + '/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    for (const body of ['null', '[]', '{}', '{broken']) {
      const invalid = await post(body);
      assert.equal(invalid.status, 400);
      assert.doesNotMatch(await invalid.text(), /stack|SyntaxError|server\/index/);
    }
    assert.equal((await post(JSON.stringify({ prompt: 'x'.repeat(17000) }))).status, 413);
    assert.equal((await fetch(base + '/api/analyze', { method: 'POST', body: 'hello' })).status, 415);
    assert.equal((await fetch(base + '/api/rooms', { headers: { Origin: 'https://evil.example' } })).status, 403);
    const valid = await post(JSON.stringify({ prompt: 'hello', wpm: 40, accuracy: 100, errors: 0,
      totalTime: 2, wordTimings: [{ word: 'hello', ms: 2000 }] }));
    assert.equal(valid.status, 200);
  });

  await t.test('foreign WebSocket upgrade requests are rejected', async () => {
    const status = await new Promise((resolve, reject) => {
      const req = http.get(base + '/socket.io/?EIO=4&transport=websocket', { headers: {
        Origin: 'https://evil.example', Connection: 'Upgrade', Upgrade: 'websocket',
        'Sec-WebSocket-Version': '13', 'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==' } });
      req.on('response', res => { res.resume(); resolve(res.statusCode); });
      req.on('upgrade', (res, socket) => { socket.destroy(); resolve(res.statusCode); });
      req.on('error', reject);
    });
    // Engine.IO uses HTTP 400 for rejected upgrades (403 for polling).
    assert.equal(status, 400);
    assert.equal((await fetch(base + '/socket.io/?EIO=4&transport=polling', {
      headers: { Origin: 'https://evil.example' },
    })).status, 403);
  });

  const host = await connect(port); clients.push(host);
  await t.test('malformed events are rejected without crashing the server', async () => {
    for (const event of ['room:create', 'room:join', 'player:ready', 'player:finished', 'powerup:grant']) {
      host.emit(event, null);
      assert.equal((await host.wait('room:error')).msg, 'Invalid event data.');
    }
    host.emit('room:create', { name: '<img src=x onerror=alert(1)>' });
    const room = await host.wait('room:joined');
    assert.doesNotMatch(room.players[0].name, /[<>]/);
    const spectator = await connect(port); clients.push(spectator);
    spectator.emit('spectator:join', { code: room.code }); await spectator.wait('spectator:joined');
    spectator.emit('room:toggle-mod', { modId: 'extra_time' });
    await sleep(100);
    assert.equal(host.queue.some(([event]) => event === 'room:mods-update'), false);
    host.emit('player:ready', {}); await host.wait('countdown:go');
    host.emit('player:progress', { progress: 1, wpm: 30 }); await host.wait('race:positions');
    host.emit('player:progress', { progress: null, wpm: 30 });
    host.emit('player:finished', { wpm: '300', accuracy: 100 });
    await sleep(100);
    assert.equal(host.queue.some(([event]) => event === 'race:finished'), false);
    for (const [event, positions] of host.queue) {
      if (event === 'race:positions') assert.equal(positions.find(p => p.id === host.id).progress, 1);
    }
    host.emit('player:give-up'); await host.wait('race:finished');
    spectator.emit('room:rematch'); await sleep(100);
    assert.equal(host.queue.some(([event]) => event === 'rematch:vote'), false);
    host.emit('room:leave'); await host.wait('room:left');
  });

  await t.test('forwarded headers cannot reset route quotas or exhaust another route', async () => {
    let last;
    for (let i = 0; i < 32; i++) last = await fetch(base + '/api/rooms', { headers: { 'X-Forwarded-For': `198.51.100.${i}` } });
    assert.equal(last.status, 429);
    assert.ok(Number(last.headers.get('retry-after')) >= 1);
    assert.equal((await fetch(base + '/api/leaderboard')).status, 200);
  });
});
