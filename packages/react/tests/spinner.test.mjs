import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { setTimeout as wait } from 'node:timers/promises';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const name of ['window', 'document', 'HTMLElement', 'SVGElement', 'Event'])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Spinner, Button, Field } = await import('../dist/index.js');

let root, host;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = undefined;
  host?.remove();
});
async function render(node) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(async () => root.render(node));
}
const settle = () => act(() => wait(150));
const svg = () => host.querySelector('[data-spinner]');
const status = () => host.querySelector('[role="status"]');

test('SSR: an aria-hidden svg sized to the text, and an empty status region', () => {
  const doc = new JSDOM(renderToString(h(Spinner))).window.document;
  const icon = doc.querySelector('svg');
  assert.equal(icon.getAttribute('aria-hidden'), 'true');
  assert.equal(icon.getAttribute('width'), '1em');
  assert.equal(icon.getAttribute('height'), '1em');
  assert.equal(icon.hasAttribute('data-size'), false);
  assert.doesNotMatch(
    icon.getAttribute('class'),
    /size-/,
    'no size class, so controls can size it',
  );
  assert.match(icon.getAttribute('class'), /motion-reduce:animate-pulse/);
  assert.equal(doc.querySelector('[role="status"]').textContent, '');
});

test('the label is written after a delay so screen readers announce it', async () => {
  await render(h(Spinner));
  assert.equal(status().textContent, '');
  await settle();
  assert.equal(status().textContent, '불러오는 중');
  await render(h(Spinner, { 'aria-label': 'Loading comments' }));
  assert.equal(status().textContent, 'Loading comments');
  assert.equal(svg().hasAttribute('aria-label'), false);
});

test('inside a button, a label or a live region the spinner goes quiet', async () => {
  await render(h(Button, { disabled: true }, h(Spinner), 'Saving'));
  await settle();
  assert.equal(status(), null);
  assert.equal(host.querySelector('button').textContent, 'Saving');

  await render(h('div', { key: 'live', role: 'alert' }, h(Spinner)));
  await settle();
  assert.equal(status(), null);

  await render(h('label', { key: 'label' }, h(Spinner), 'Name'));
  await settle();
  assert.equal(status(), null);
});

test('decorative forces either way', async () => {
  await render(h(Spinner, { decorative: true }));
  await settle();
  assert.equal(status(), null);
  await render(h(Button, { key: 'b' }, h(Spinner, { decorative: false })));
  await settle();
  assert.equal(status().textContent, '불러오는 중');
});

test('an explicit size, or the Field size, puts the icon token on the svg', async () => {
  await render(h(Spinner, { size: 'tiny' }));
  assert.equal(svg().dataset.size, 'tiny');
  assert.match(svg().getAttribute('class'), /size-\(--ids-size-icon-tiny\)/);

  await render(
    h(
      Field,
      { key: 'field', size: 'tiny' },
      h(Field.Label, null, 'Name'),
      h('input'),
      h(Field.Hint, null, h(Spinner)),
    ),
  );
  assert.equal(svg().dataset.size, 'tiny');
});

test('className and other props go to the svg, className may read the state', async () => {
  const states = [];
  await render(
    h(Spinner, {
      id: 'spin',
      className: (state) => {
        states.push(state);
        return state.announced ? 'size-8 done' : 'size-8';
      },
    }),
  );
  assert.equal(svg().id, 'spin');
  await settle();
  assert.match(svg().getAttribute('class'), /size-8 done/);
  assert.deepEqual(states.at(-1), { size: undefined, announced: true });
});
