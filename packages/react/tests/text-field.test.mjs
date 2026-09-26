import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const name of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Event'])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, Fragment } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { TextField } = await import('../dist/index.js');
let root;
let host;
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
const control = () => host.querySelector('input');
async function input(value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(control(), value);
    control().dispatchEvent(new Event('input', { bubbles: true }));
  });
}

test('Input values win over root values, but root and Input handlers both run', async () => {
  const changes = [];
  await render(
    h(
      TextField,
      { id: 'root-id', name: 'root', onChange: () => changes.push('root') },
      h(TextField.Input, { name: 'input', onChange: () => changes.push('input') }),
    ),
  );
  assert.equal(control().id, 'root-id');
  assert.equal(control().name, 'input');
  await input('a');
  assert.deepEqual(changes, ['root', 'input']);
});

test('sentinel inside a Fragment splits leading and trailing adornments', async () => {
  await render(
    h(
      TextField,
      { 'aria-label': 'Search' },
      h(Fragment, null, h('span', null, 'Lead'), h(TextField.Input), h('span', null, 'Trail')),
    ),
  );
  assert.deepEqual(
    Array.from(host.querySelector('[data-text-field]').children, (el) =>
      'textFieldAdornment' in el.dataset ? el.textContent : el.tagName,
    ),
    ['Lead', 'INPUT', 'Trail'],
  );
});

test('asChild merges props and ref into the child input', async () => {
  let node;
  const changes = [];
  await render(
    h(
      TextField,
      {
        name: 'q',
        onChange: () => changes.push('root'),
        ref: (value) => {
          node = value;
        },
      },
      h(
        TextField.Input,
        { asChild: true },
        h('input', { spellCheck: false, onChange: () => changes.push('child') }),
      ),
    ),
  );
  assert.equal(node, control());
  assert.equal(control().name, 'q');
  assert.equal(control().getAttribute('spellcheck'), 'false');
  assert.ok('textFieldInput' in control().dataset);
  await input('a');
  assert.deepEqual(changes, ['child', 'root']);
});

test('invalid structures fail clearly', () => {
  for (const node of [
    h(TextField, null, h(TextField.Input), h(TextField.Input)),
    h(TextField, null, h(TextField.Input, { asChild: true }, h('textarea'))),
    h(TextField, null, h(TextField.Input, null, 'text')),
  ])
    assert.throws(() => renderToString(node), /\[IDS\] `<TextField/);
});
