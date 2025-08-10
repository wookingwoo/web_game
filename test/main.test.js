const test = require('node:test');
const assert = require('node:assert');
const { loadGame, returnToMenu } = require('../js/main.js');

test('loadGame loads a game and updates DOM', () => {
  const elements = {
    '.game-menu': { style: { display: 'grid' } },
    'game-container': { style: { display: 'none' } },
    'game-frame': { src: '' },
    'current-game-title': { textContent: '' }
  };
  global.document = {
    querySelector: (sel) => elements[sel],
    getElementById: (id) => elements[id]
  };
  loadGame('dodge-the-poop');
  assert.strictEqual(elements['.game-menu'].style.display, 'none');
  assert.strictEqual(elements['game-container'].style.display, 'block');
  assert.ok(elements['game-frame'].src.includes('games/dodge-the-poop/index.html'));
  assert.strictEqual(elements['current-game-title'].textContent, 'Dodge the Poop');
  delete global.document;
});

test('returnToMenu resets the game view', () => {
  const elements = {
    '.game-menu': { style: { display: 'none' } },
    'game-container': { style: { display: 'block' } },
    'game-frame': { src: 'something' }
  };
  const doc = {
    querySelector: (sel) => elements[sel],
    getElementById: (id) => elements[id],
    exitFullscreen: () => { doc.fullscreenElement = null; },
    fullscreenElement: null
  };
  global.document = doc;
  returnToMenu();
  assert.strictEqual(elements['game-container'].style.display, 'none');
  assert.strictEqual(elements['.game-menu'].style.display, 'grid');
  assert.strictEqual(elements['game-frame'].src, '');
  delete global.document;
});
