const test = require('node:test');
const assert = require('node:assert');
const { loadGame, returnToMenu } = require('../js/main.js');

function makeMockDOM(overrides = {}) {
  const elements = {
    '.game-menu': { style: {}, innerHTML: '' },
    '.controls': { style: {} },
    'header': { style: {} },
    'game-menu': { style: {} },
    'game-container': { style: {} },
    'game-frame': { src: '' },
    'current-game-title': { textContent: '' },
    'no-results': { style: {} },
    'search-input': { value: '' },
    'game-count': { textContent: '' },
    ...overrides,
  };
  return {
    querySelector: (sel) => elements[sel],
    getElementById: (id) => elements[id],
    querySelectorAll: () => [],
    fullscreenElement: null,
    exitFullscreen: () => {},
    elements,
  };
}

test('loadGame hides menu and shows game container', () => {
  const doc = makeMockDOM({
    'game-menu': { style: { display: 'grid' } },
    'game-container': { style: { display: 'none' } },
    'game-frame': { src: '' },
    'current-game-title': { textContent: '' },
    '.game-menu': { style: { display: 'grid' }, innerHTML: '' },
    '.controls': { style: { display: '' } },
    'header': { style: { display: '' } },
    'no-results': { style: { display: '' } },
  });
  global.document = doc;
  loadGame('dodge-the-poop');
  assert.strictEqual(doc.elements['game-container'].style.display, 'block');
  assert.ok(doc.elements['game-frame'].src.includes('games/dodge-the-poop/index.html'));
  assert.strictEqual(doc.elements['current-game-title'].textContent, 'Dodge the Poop');
  delete global.document;
});

test('loadGame loads virtual drum kit', () => {
  const doc = makeMockDOM({
    'game-menu': { style: {} },
    'game-container': { style: { display: 'none' } },
    'game-frame': { src: '' },
    'current-game-title': { textContent: '' },
    '.game-menu': { style: {}, innerHTML: '' },
    '.controls': { style: {} },
    'header': { style: {} },
    'no-results': { style: {} },
  });
  global.document = doc;
  loadGame('virtual-drum-kit');
  assert.strictEqual(doc.elements['game-container'].style.display, 'block');
  assert.ok(doc.elements['game-frame'].src.includes('games/virtual-drum-kit/index.html'));
  assert.strictEqual(doc.elements['current-game-title'].textContent, 'Virtual Drum Kit');
  delete global.document;
});

test('returnToMenu hides game container and resets frame', () => {
  const doc = makeMockDOM({
    'game-container': { style: { display: 'block' } },
    'game-frame': { src: 'something' },
    '.game-menu': { style: { display: 'none' }, innerHTML: '' },
    'game-menu': { style: { display: 'none' } },
    '.controls': { style: { display: 'none' } },
    'header': { style: { display: 'none' } },
    'no-results': { style: { display: 'none' } },
    'search-input': { value: '' },
  });
  doc.querySelectorAll = () => [];
  global.document = doc;
  returnToMenu();
  assert.strictEqual(doc.elements['game-container'].style.display, 'none');
  assert.strictEqual(doc.elements['game-frame'].src, '');
  delete global.document;
});
