import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const { createElement: h } = await import('react');
const { renderToString } = await import('react-dom/server');
const { AspectRatio } = await import('../dist/index.js');

const render = (props, ...children) =>
  new JSDOM(renderToString(h(AspectRatio, props, ...children))).window.document.querySelector(
    '[data-aspect-ratio]',
  );

test('the box carries the ratio and the content sits in an absolute layer', () => {
  const box = render({ ratio: 16 / 9, id: 'frame' }, h('img', { alt: '' }));
  assert.equal(box.id, 'frame');
  assert.match(box.getAttribute('style'), /aspect-ratio:\s*1\.77/);
  assert.match(box.className, /relative w-full/);
  const layer = box.firstElementChild;
  assert.match(layer.className, /absolute inset-0/);
  assert.ok(layer.querySelector('img'));
});

test('children fill and media crops, both at zero specificity', () => {
  const layer = render({}, h('div')).firstElementChild;
  assert.match(layer.className, /\[:where\(&>\*\)\]:size-full/);
  assert.match(layer.className, /\[:where\(&>img,&>video\)\]:object-cover/);
});

test('the ratio defaults to a square and must be a finite positive number', () => {
  assert.match(render({}).getAttribute('style'), /aspect-ratio:\s*1\b/);
  for (const ratio of [0, -1, Infinity, NaN])
    assert.throws(() => renderToString(h(AspectRatio, { ratio })), /finite positive number/);
});

test('className and style may read the state, and style wins', () => {
  const box = render({
    ratio: 2,
    className: (state) => `ratio-${state.ratio}`,
    style: () => ({ aspectRatio: '3' }),
  });
  assert.match(box.className, /ratio-2/);
  assert.match(box.getAttribute('style'), /aspect-ratio:\s*3/);
});
