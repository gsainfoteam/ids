import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const name of ['window', 'document', 'HTMLElement', 'Event', 'MouseEvent'])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, createRef, Fragment } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Slot } = await import('../dist/index.js');

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

const html = (node) => new JSDOM(renderToString(node)).window.document.body.firstElementChild;

test('renders only the child, with class names merged and Slot winning conflicts', () => {
  const element = html(
    h(
      Slot,
      { className: 'px-2 text-red-500' },
      h('a', { href: '/x', className: 'px-4 underline' }),
    ),
  );
  assert.equal(element.tagName, 'A');
  assert.equal(element.getAttribute('href'), '/x');
  assert.deepEqual(element.className.split(' ').sort(), ['px-2', 'text-red-500', 'underline']);
});

test('style is merged shallowly, other props go to the Slot unless it leaves them undefined', () => {
  const element = html(
    h(
      Slot,
      { style: { color: 'blue' }, 'aria-label': 'slot', title: undefined },
      h('span', { style: { color: 'red', fontWeight: 600 }, 'aria-label': 'child', title: 'kept' }),
    ),
  );
  assert.equal(element.style.color, 'blue');
  assert.equal(element.style.fontWeight, '600');
  assert.equal(element.getAttribute('aria-label'), 'slot');
  assert.equal(element.getAttribute('title'), 'kept');
});

test('handlers run child first, and a prevented event skips the Slot handler', async () => {
  const calls = [];
  await render(
    h(
      'div',
      null,
      h(
        Slot,
        { onClick: () => calls.push('slot') },
        h('button', { id: 'both', onClick: () => calls.push('child') }),
      ),
      h(
        Slot,
        { onClick: () => calls.push('skipped') },
        h('button', { id: 'stop', onClick: (event) => event.preventDefault() }),
      ),
    ),
  );
  await act(async () => host.querySelector('#both').click());
  await act(async () => host.querySelector('#stop').click());
  assert.deepEqual(calls, ['child', 'slot']);
});

test('both refs receive the element', async () => {
  const slotRef = createRef();
  const childRef = createRef();
  await render(h(Slot, { ref: slotRef }, h('button', { ref: childRef })));
  assert.equal(slotRef.current, host.querySelector('button'));
  assert.equal(childRef.current, host.querySelector('button'));
});

test('one element child is required, and not a Fragment', () => {
  assert.throws(() => renderToString(h(Slot, null, 'text')), /exactly one React element/);
  assert.throws(() => renderToString(h(Slot, null, h('a'), h('b'))), /exactly one React element/);
  assert.throws(() => renderToString(h(Slot, null, h(Fragment, null, h('a')))), /Fragment/);
});
