'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { normalizeTypingText } = require('../public/typing-text');

test('normalizes smart punctuation, invisible characters, and unusual spaces', () => {
  assert.equal(normalizeTypingText('night’s “quiet” town—at\u00a0dusk…\u200b'), 'night\'s "quiet" town-at dusk...');
  assert.equal(normalizeTypingText('night`s'), "night's");
});

const html = fs.readFileSync(path.join(__dirname, '../public/game.js'), 'utf8');
const handler = html.slice(html.indexOf('function onTyping()'), html.indexOf('// ── Sprite position helpers'));

for (const input of ["night's", 'night`s', 'night’s']) {
  test(`typing ${input} completes a normalized apostrophe word`, () => {
    const inp = { value: input, classList: { remove() {} } };
    let completed = false;
    const state = { isRacing: true, finished: false, words: [normalizeTypingText('night’s')],
      wordIndex: 0, wordStartTime: 0, totalTyped: 0, correctChars: 0, wordTimings: [] };
    const context = vm.createContext({ state, socket: { connected: true }, normalizeTypingText, document: { getElementById() { return inp; } },
      calcWpm: () => 40, setSpriteTarget() {}, renderPrompt() {}, finishRace() { completed = true; } });
    vm.runInContext(handler, context);
    context.onTyping();
    assert.equal(completed, true);
    assert.equal(state.correctChars, 7);
  });
}
