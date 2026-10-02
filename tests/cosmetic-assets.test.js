const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public/game.js'), 'utf8');
const configuration = html.match(/const THEMES = ([\s\S]*?);\s*const SPRITES = ([\s\S]*?);/);
const themes = vm.runInNewContext(`(${configuration[1]})`);
const sprites = vm.runInNewContext(`(${configuration[2]})`);
const server = fs.readFileSync(path.join(root, 'server/index.js'), 'utf8');
const allowed = vm.runInNewContext(server.match(/const VALID_SPRITES\s*=\s*(\[[^;]+\]);/)[1]);

test('all selectable cosmetics point to shipped image files', () => {
  for (const theme of Object.values(themes)) {
    for (const url of [theme.thumb, ...theme.layers.map(layer => layer.src)].filter(Boolean)) {
      assert.ok(fs.existsSync(path.join(root, 'public', url)), `Missing ${url}`);
    }
  }
});

test('every runner sheet matches its animation frames and multiplayer whitelist', () => {
  for (const [id, sprite] of Object.entries(sprites)) {
    const png = fs.readFileSync(path.join(root, 'public', sprite.file));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 32 * sprite.frames, `${id} strip width`);
    assert.equal(png.readUInt32BE(20), 32, `${id} frame height`);
    assert.ok(allowed.includes(id), `${id} cannot be selected in multiplayer`);
  }
});
