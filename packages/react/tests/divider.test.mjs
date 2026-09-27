import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const { createElement: h } = await import('react');
const { renderToString } = await import('react-dom/server');
const { Divider } = await import('../dist/index.js');

const render = (props, ...children) =>
  new JSDOM(renderToString(h(Divider, props, ...children))).window.document.querySelector(
    '[data-divider]',
  );

test('a plain divider is a horizontal separator without focus or children', () => {
  const divider = render({});
  assert.equal(divider.getAttribute('role'), 'separator');
  assert.equal(divider.getAttribute('aria-orientation'), 'horizontal');
  assert.equal(divider.hasAttribute('tabindex'), false);
  assert.equal(divider.children.length, 0);
  assert.match(divider.className, /bg-\(--ids-color-border\)/);
  assert.match(divider.className, /h-px w-full/);
});

test('vertical dividers stretch in a flex row and keep one line outside it', () => {
  const divider = render({ orientation: 'vertical' });
  assert.equal(divider.getAttribute('aria-orientation'), 'vertical');
  assert.equal(divider.dataset.orientation, 'vertical');
  assert.match(divider.className, /self-stretch/);
  assert.match(divider.className, /min-h-\[1lh\]/);
});

test('a label names the separator by reference', () => {
  const divider = render({}, 'or');
  const label = divider.querySelector('span');
  assert.equal(label.textContent, 'or');
  assert.equal(divider.getAttribute('aria-labelledby'), label.id);
  assert.ok(divider.hasAttribute('data-labelled'));
  assert.equal(divider.dataset.align, 'center');
  assert.doesNotMatch(divider.className, /before:hidden|after:hidden/);
});

test('align start and end hide the line on that side', () => {
  assert.match(render({ align: 'start' }, 'Recent').className, /before:hidden/);
  assert.match(render({ align: 'end' }, 'More').className, /after:hidden/);
  assert.equal(render({ align: 'start' }).dataset.align, undefined, 'no label, no align');
});

test('aria-label and aria-labelledby win over the label', () => {
  const named = render({ 'aria-label': 'Section break' }, 'or');
  assert.equal(named.getAttribute('aria-label'), 'Section break');
  assert.equal(named.hasAttribute('aria-labelledby'), false);
  assert.equal(render({ 'aria-labelledby': 'x' }, 'or').getAttribute('aria-labelledby'), 'x');
});

test('decorative dividers leave the accessibility tree', () => {
  const divider = render({ decorative: true }, 'or');
  assert.equal(divider.hasAttribute('role'), false);
  assert.equal(divider.getAttribute('aria-hidden'), 'true');
  assert.equal(divider.hasAttribute('aria-labelledby'), false);
});

test('className and style may read the state', () => {
  const divider = render({
    orientation: 'vertical',
    className: (state) => `is-${state.orientation}-${state.labelled}`,
    style: (state) => ({ opacity: state.decorative ? 0.5 : 1 }),
  });
  assert.match(divider.className, /is-vertical-false/);
  assert.equal(divider.style.opacity, '1');
});

test('asChild draws the line as the child element, without a label', () => {
  const list = new JSDOM(
    renderToString(h('ul', null, h(Divider, { asChild: true, decorative: true }, h('li')))),
  ).window.document;
  const line = list.querySelector('ul > li');
  assert.ok(line.hasAttribute('data-divider'));
  assert.equal(line.getAttribute('aria-hidden'), 'true');
  assert.equal(line.children.length, 0);
  assert.match(line.className, /h-px w-full/);
  const rule = new JSDOM(renderToString(h(Divider, { asChild: true }, h('hr')))).window.document
    .body.firstElementChild;
  assert.equal(rule.tagName, 'HR');
  assert.equal(rule.getAttribute('role'), 'separator');
  assert.throws(() => renderToString(h(Divider, { asChild: true }, 'or')), /asChild/);
});
