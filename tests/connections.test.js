'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Minimal Socket.IO test client over Node's built-in WebSocket: no new dependency.
async function connect(port, recovery) {
  const ws = new WebSocket(`ws://localhost:${port}/socket.io/?EIO=4&transport=websocket`);
  const client = { ws, queue: [], id: null, pid: null, offset: null };
  ws.onmessage = ({ data }) => {
    const packet = String(data);
    if (packet.startsWith('0')) ws.send('40' + (recovery ? JSON.stringify(recovery) : ''));
    else if (packet === '2') ws.send('3');
    else if (packet.startsWith('40')) {
      const auth = JSON.parse(packet.slice(2));
      client.id = auth.sid;
      client.pid = auth.pid;
    } else if (packet.startsWith('42')) {
      const args = JSON.parse(packet.slice(2));
      if (typeof args.at(-1) === 'string') client.offset = args.at(-1);
      client.queue.push(args);
    }
  };
  client.emit = (event, data) => ws.send('42' + JSON.stringify([event, data]));
  client.wait = async (event, predicate = () => true, timeout = 5000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const index = client.queue.findIndex(args => args[0] === event && predicate(args[1]));
      if (index !== -1) return client.queue.splice(index, 1)[0][1];
      await sleep(20);
    }
    throw new Error(`Timed out waiting for ${event}`);
  };
  for (let i = 0; !client.id && i < 150; i++) await sleep(20);
  assert.ok(client.id, 'Socket.IO handshake must complete');
  return client;
}

test('room membership and connection recovery integration', { timeout: 40000 }, async t => {
  const reservation = net.createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const server = spawn(process.execPath, ['server/index.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(port), GROQ_API_KEY: '', NODE_ENV: 'development' },
    stdio: 'ignore',
  });
  const clients = [];
  t.after(() => { for (const client of clients) client.ws.close(); server.kill(); });
  let started = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`http://localhost:${port}/api/rooms`)).ok) { started = true; break; } } catch {}
    await sleep(50);
  }
  assert.ok(started, 'Server starts');
  const open = async recovery => { const c = await connect(port, recovery); clients.push(c); return c; };
  const a = await open();
  const b = await open();

  await t.test('switching rooms removes the previous membership and transfers host', async () => {
    a.emit('room:create', { name: 'Host' });
    const first = await a.wait('room:joined');
    b.emit('room:join', { name: 'Guest', code: first.code });
    await b.wait('room:joined');
    a.emit('room:create', { name: 'Host' });
    const second = await a.wait('room:joined');
    assert.notEqual(first.code, second.code);
    const updated = await b.wait('room:update', r => r.code === first.code && r.players.length === 1);
    assert.equal(updated.hostId, b.id);
    assert.equal(updated.players[0].id, b.id);
    a.emit('room:join', { name: 'Host', code: first.code });
    await a.wait('room:joined');
    const rooms = await (await fetch(`http://localhost:${port}/api/rooms`)).json();
    assert.equal(rooms.some(r => r.code === second.code), false);
    a.emit('room:join', { name: 'Host', code: 'ZZZZZZ' });
    await a.wait('room:error');
    a.emit('player:set-appearance', { spriteId: 'dude' });
    await b.wait('room:update', r => r.players.some(p => p.id === a.id && p.spriteId === 'dude'));
  });

  await t.test('explicit leave removes the player immediately and the final leave deletes the room', async () => {
    a.emit('room:leave'); await a.wait('room:left');
    await b.wait('room:update', r => r.players.length === 1);
    b.emit('room:leave'); await b.wait('room:left');
    assert.equal((await (await fetch(`http://localhost:${port}/api/rooms`)).json()).length, 0);
  });

  await t.test('spectator departure does not reset the room or change its players', async () => {
    a.emit('room:create', { name: 'Host' });
    const room = await a.wait('room:joined');
    b.emit('spectator:join', { code: room.code }); await b.wait('spectator:joined');
    b.emit('room:leave'); await b.wait('room:left');
    a.emit('player:set-appearance', { spriteId: 'owlet' });
    const updated = await a.wait('room:update', r => r.players[0]?.spriteId === 'owlet');
    assert.equal(updated.hostId, a.id);
    assert.equal(updated.players.length, 1);
    b.emit('spectator:join', { code: room.code }); await b.wait('spectator:joined');
    a.emit('room:leave'); await a.wait('room:left');
    await b.wait('room:closed');
  });

  let recovered;
  await t.test('brief network loss restores the same racer and active race progress', async () => {
    a.emit('room:create', { name: 'Host' }); const room = await a.wait('room:joined');
    b.emit('room:join', { name: 'Guest', code: room.code }); await b.wait('room:joined');
    a.emit('player:ready', {}); b.emit('player:ready', {});
    await a.wait('countdown:go'); await b.wait('countdown:go');
    b.emit('player:progress', { progress: 45, wpm: 0, typedLength: 20 });
    await a.wait('race:positions', positions => positions.some(p => p.id === b.id && p.progress === 45));
    await b.wait('race:positions', positions => positions.some(p => p.id === b.id && p.progress === 45));
    const recovery = { pid: b.pid, offset: b.offset };
    b.ws.close();
    await a.wait('room:update', r => r.players.some(p => p.id === b.id && p.connected === false));
    recovered = await open(recovery);
    assert.equal(recovered.id, b.id);
    const resumed = await recovered.wait('room:resumed');
    assert.equal(resumed.state, 'racing');
    assert.equal(resumed.players.length, 2);
    assert.equal(resumed.players.find(p => p.id === b.id).progress, 45);
    assert.equal(resumed.players.find(p => p.id === b.id).connected, true);
    recovered.emit('player:progress', { progress: 55, wpm: 0 });
    await a.wait('race:positions', positions => positions.some(p => p.id === b.id && p.progress === 55));
    recovered.emit('room:leave'); await recovered.wait('room:left');
    a.emit('room:leave'); await a.wait('room:left');
  });

  await t.test('a departing player no longer blocks the remaining rematch votes', async () => {
    const c = await open();
    recovered.emit('room:create', { name: 'Host' }); const room = await recovered.wait('room:joined');
    a.emit('room:join', { name: 'Guest A', code: room.code }); await a.wait('room:joined');
    c.emit('room:join', { name: 'Guest C', code: room.code }); await c.wait('room:joined');
    recovered.emit('player:ready', {}); a.emit('player:ready', {}); c.emit('player:ready', {});
    await recovered.wait('countdown:go'); await a.wait('countdown:go'); await c.wait('countdown:go');
    recovered.emit('player:finished', { wpm: 0 }); a.emit('player:finished', { wpm: 0 });
    c.emit('player:give-up'); await recovered.wait('race:finished');
    recovered.emit('room:rematch'); a.emit('room:rematch');
    await recovered.wait('rematch:vote', vote => vote.votes === 2 && vote.total === 3);
    c.emit('room:leave'); await c.wait('room:left');
    const reset = await recovered.wait('room:update', r => r.code === room.code && r.state === 'waiting' && r.players.length === 2);
    assert.ok(reset.players.every(p => !p.ready && !p.finishTime && !p.gaveUp));
    a.emit('room:leave'); await a.wait('room:left');
    recovered.emit('room:leave'); await recovered.wait('room:left');
    c.ws.close();
  });

  await t.test('expired recovery removes the disconnected host and elects the remaining player', async () => {
    a.emit('room:create', { name: 'Host' }); const room = await a.wait('room:joined');
    recovered.emit('room:join', { name: 'Guest', code: room.code }); await recovered.wait('room:joined');
    a.ws.close();
    await recovered.wait('room:update', r => r.code === room.code && r.players.some(p => p.id === a.id && p.connected === false));
    const updated = await recovered.wait('room:update', r => r.code === room.code && r.players.length === 1, 23000);
    assert.equal(updated.hostId, recovered.id);
    recovered.emit('room:leave'); await recovered.wait('room:left');
    assert.equal((await (await fetch(`http://localhost:${port}/api/rooms`)).json()).length, 0);
  });
});
