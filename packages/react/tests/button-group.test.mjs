import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const { createElement: h } = await import('react');
const { renderToString } = await import('react-dom/server');
const { Button, ButtonGroup, IconButton, Toggle } = await import('../dist/index.js');

const ssr = (node) => new JSDOM(renderToString(node)).window.document;
const svg = h('svg', { 'aria-hidden': true });

test('a named group that hands its size and variant down unless a control sets its own', () => {
  const doc = ssr(
    h(
      ButtonGroup,
      { 'aria-label': '편집', size: 'tiny', variant: 'outline' },
      h(Button, { id: 'button' }, '저장'),
      h(IconButton, { id: 'icon', icon: svg, 'aria-label': '더보기' }),
      h(Toggle, { id: 'toggle' }, '굵게'),
      h(Button, { id: 'own', size: 'standard', variant: 'solid' }, '게시'),
    ),
  );
  const group = doc.querySelector('[role="group"]');
  assert.equal(group.getAttribute('aria-label'), '편집');
  assert.equal(group.dataset.orientation, 'horizontal');
  for (const id of ['button', 'icon', 'toggle']) {
    const control = doc.getElementById(id);
    assert.equal(control.dataset.size, 'tiny', id);
    assert.equal(control.dataset.variant, 'outline', id);
  }
  assert.equal(doc.getElementById('own').dataset.size, 'standard');
  assert.equal(doc.getElementById('own').dataset.variant, 'solid');
});

test('an inner group inherits the outer size and variant', () => {
  const doc = ssr(
    h(
      ButtonGroup,
      { 'aria-label': '편집', size: 'tiny', variant: 'soft' },
      h(ButtonGroup, null, h(Button, { id: 'inner' }, '복사')),
    ),
  );
  assert.equal(doc.getElementById('inner').dataset.size, 'tiny');
  assert.equal(doc.getElementById('inner').dataset.variant, 'soft');
  assert.equal(doc.querySelectorAll('[role="group"]').length, 2);
});

test('the separator is announced across the group direction', () => {
  const horizontal = ssr(
    h(ButtonGroup, { 'aria-label': '저장' }, h(Button, null, '저장'), h(ButtonGroup.Separator)),
  );
  assert.equal(
    horizontal.querySelector('[role="separator"]').getAttribute('aria-orientation'),
    'vertical',
  );
  const vertical = ssr(
    h(ButtonGroup, { 'aria-label': '저장', orientation: 'vertical' }, h(ButtonGroup.Separator)),
  );
  assert.equal(
    vertical.querySelector('[role="separator"]').getAttribute('aria-orientation'),
    'horizontal',
  );
  assert.throws(() => renderToString(h(ButtonGroup.Separator)), /inside ButtonGroup/);
});

test('Text joins like an outline control and can render as its child', () => {
  const doc = ssr(
    h(
      ButtonGroup,
      { 'aria-label': '주소', size: 'tiny' },
      h(ButtonGroup.Text, { id: 'text' }, 'https://'),
      h(ButtonGroup.Text, { asChild: true }, h('label', { id: 'label', htmlFor: 'url' }, 'URL')),
    ),
  );
  assert.equal(doc.getElementById('text').dataset.variant, 'outline');
  assert.match(doc.getElementById('text').className, /text-button-tiny/);
  assert.equal(doc.getElementById('label').tagName, 'LABEL');
  assert.equal(doc.getElementById('label').dataset.variant, 'outline');
});
