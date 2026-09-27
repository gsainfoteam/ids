import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const { createElement: h } = await import('react');
const { renderToString } = await import('react-dom/server');
const { Spacer } = await import('../dist/index.js');

const render = (node) => new JSDOM(renderToString(node)).window.document;

test('a hidden span that grows by its flex share', () => {
  const spacer = render(h(Spacer)).querySelector('[data-spacer]');
  assert.equal(spacer.tagName, 'SPAN');
  assert.equal(spacer.getAttribute('aria-hidden'), 'true');
  assert.equal(spacer.style.flexGrow, '1');
  assert.equal(spacer.textContent, '');
  assert.match(spacer.className, /basis-0/);
  assert.equal(render(h(Spacer, { flex: 2 })).querySelector('span').style.flexGrow, '2');
});

test('it is valid inside a button', () => {
  const doc = render(h('button', null, 'Search', h(Spacer), h('kbd', null, 'K')));
  assert.equal(doc.querySelector('button > span[data-spacer]') !== null, true);
});

test('flex must be a finite positive number', () => {
  for (const flex of [0, -1, Infinity, NaN])
    assert.throws(() => renderToString(h(Spacer, { flex })), /finite positive number/);
});

test('className and style may read the state, and style wins over flex', () => {
  const spacer = render(
    h(Spacer, {
      flex: 3,
      className: (state) => `share-${state.flex}`,
      style: () => ({ flexGrow: 5 }),
    }),
  ).querySelector('span');
  assert.match(spacer.className, /share-3/);
  assert.equal(spacer.style.flexGrow, '5');
});
