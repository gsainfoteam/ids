import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const { createElement: h } = await import('react');
const { renderToString } = await import('react-dom/server');
const { Button, ButtonGroup, Toggle, ToggleGroup } = await import('../dist/index.js');

const separator = (node) =>
  new JSDOM(renderToString(node)).window.document.querySelector('[data-group-separator]');

test('the separator is a Divider across the group that overlaps the joined borders', () => {
  const line = separator(
    h(
      ButtonGroup,
      { 'aria-label': '저장' },
      h(Button, null, '저장'),
      h(ButtonGroup.Separator, { id: 'line' }),
      h(Button, null, '더보기'),
    ),
  );
  assert.ok(line.hasAttribute('data-divider'));
  assert.equal(line.id, 'line');
  assert.equal(line.getAttribute('role'), 'separator');
  assert.equal(line.getAttribute('aria-orientation'), 'vertical');
  assert.equal(line.dataset.orientation, 'vertical');
  for (const name of ['w-px', 'z-25', '-mx-px']) assert.ok(line.classList.contains(name), name);

  const vertical = separator(
    h(ButtonGroup, { 'aria-label': '저장', orientation: 'vertical' }, h(ButtonGroup.Separator)),
  );
  assert.equal(vertical.getAttribute('aria-orientation'), 'horizontal');
  for (const name of ['h-px', '-my-px']) assert.ok(vertical.classList.contains(name), name);

  const spaced = separator(
    h(ButtonGroup, { 'aria-label': '저장', attached: false }, h(ButtonGroup.Separator)),
  );
  assert.equal(spaced.classList.contains('-mx-px'), false, 'spaced controls leave no seam');
});

test('inside a single-select ToggleGroup the separator only draws a line', () => {
  const line = separator(
    h(
      ToggleGroup,
      { 'aria-label': '정렬', defaultValue: 'left' },
      h(Toggle, { value: 'left' }, '왼쪽'),
      h(ToggleGroup.Separator),
      h(Toggle, { value: 'right' }, '오른쪽'),
    ),
  );
  assert.ok(line.hasAttribute('data-divider'));
  assert.equal(line.getAttribute('aria-hidden'), 'true');
  assert.equal(line.hasAttribute('role'), false);
});
