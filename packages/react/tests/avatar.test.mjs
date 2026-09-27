import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const name of [
  'window',
  'document',
  'Node',
  'Element',
  'HTMLElement',
  'HTMLImageElement',
  'Event',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Avatar, initialsOf } = await import('../dist/index.js');

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
const wait = (ms) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));
const avatar = () => host.querySelector('[data-avatar]');
const image = () => host.querySelector('img');
const fire = (element, type) =>
  act(async () => {
    element.dispatchEvent(new Event(type));
  });

test('SSR: a named image with an empty inner alt, and no fallback while the image loads', () => {
  const doc = new JSDOM(renderToString(h(Avatar, { src: '/alice.png', name: 'Alice Kim' }))).window
    .document;
  const root = doc.querySelector('[data-avatar]');
  assert.equal(root.getAttribute('role'), 'img');
  assert.equal(root.getAttribute('aria-label'), 'Alice Kim');
  assert.equal(root.dataset.status, 'loading');
  assert.equal(root.dataset.shape, 'circle');
  assert.equal(root.dataset.size, 'standard');
  const img = doc.querySelector('img');
  assert.equal(img.getAttribute('alt'), '');
  assert.equal(img.getAttribute('loading'), 'lazy');
  assert.equal(img.getAttribute('decoding'), 'async');
  assert.equal(doc.querySelector('[data-avatar-fallback]'), null, 'initials wait for the image');
});

test('without an image the fallback shows at once: initials, or an icon without a name', () => {
  const html = (props) =>
    new JSDOM(renderToString(h(Avatar, props))).window.document.querySelector('[data-avatar]');
  const named = html({ name: '류현승' });
  assert.equal(named.dataset.status, 'error');
  assert.equal(named.textContent, '류');
  assert.equal(named.querySelector('[data-avatar-fallback]').getAttribute('aria-hidden'), 'true');
  const anonymous = html({ alt: 'Unknown user' });
  assert.equal(anonymous.getAttribute('aria-label'), 'Unknown user');
  assert.ok(anonymous.querySelector('[data-avatar-fallback] svg'));
});

test('load and error move the status; a broken image leaves the DOM for the initials', async () => {
  const statuses = [];
  await render(
    h(Avatar, { src: '/a.png', name: 'Alice Kim', onStatusChange: (s) => statuses.push(s) }),
  );
  assert.equal(avatar().dataset.status, 'loading');
  await fire(image(), 'load');
  assert.equal(avatar().dataset.status, 'loaded');
  assert.equal(host.querySelector('[data-avatar-fallback]'), null);
  await render(
    h(Avatar, { src: '/b.png', name: 'Alice Kim', onStatusChange: (s) => statuses.push(s) }),
  );
  assert.equal(avatar().dataset.status, 'loading', 'a new src starts over');
  await fire(image(), 'error');
  assert.equal(avatar().dataset.status, 'error');
  assert.equal(image(), null);
  assert.equal(avatar().textContent, 'AK');
  assert.deepEqual(statuses, ['loading', 'loaded', 'loading', 'error']);
});

test('the fallback waits for its delay while the image loads', async () => {
  await render(h(Avatar, { src: '/slow.png', name: 'Bob Lee' }, h(Avatar.Fallback, { delay: 40 })));
  assert.equal(host.querySelector('[data-avatar-fallback]'), null);
  await wait(60);
  assert.equal(host.querySelector('[data-avatar-fallback]').textContent, 'BL');
  await fire(image(), 'load');
  assert.equal(host.querySelector('[data-avatar-fallback]'), null);
});

test('a late event from a previous src does not overwrite the current one', async () => {
  function App() {
    const [src, setSrc] = useState('/old.png');
    return h(
      'div',
      null,
      h(Avatar, { src, name: 'Alice Kim' }),
      h('button', { onClick: () => setSrc('/new.png') }, 'swap'),
    );
  }
  await render(h(App));
  const old = image();
  await act(async () => host.querySelector('button').click());
  assert.notEqual(image(), old, 'the new src is a new element');
  await fire(image(), 'load');
  await fire(old, 'error');
  assert.equal(avatar().dataset.status, 'loaded');
});

test('an image that completed before React listened is read on mount', async () => {
  const proto = HTMLImageElement.prototype;
  const complete = Object.getOwnPropertyDescriptor(proto, 'complete');
  const naturalWidth = Object.getOwnPropertyDescriptor(proto, 'naturalWidth');
  Object.defineProperty(proto, 'complete', { configurable: true, get: () => true });
  Object.defineProperty(proto, 'naturalWidth', { configurable: true, get: () => 64 });
  try {
    await render(h(Avatar, { src: '/cached.png', name: 'Alice Kim' }));
    assert.equal(avatar().dataset.status, 'loaded');
  } finally {
    Object.defineProperty(proto, 'complete', complete);
    Object.defineProperty(proto, 'naturalWidth', naturalWidth);
  }
});

test('alt="" makes it decorative; state reaches className and fallback children', async () => {
  await render(h(Avatar, { name: 'Alice Kim', alt: '' }));
  assert.equal(avatar().getAttribute('aria-hidden'), 'true');
  assert.equal(avatar().hasAttribute('role'), false);
  await render(
    h(
      Avatar,
      {
        name: 'Acme',
        shape: 'square',
        size: 'tiny',
        className: (state) => `status-${state.status} shape-${state.shape}`,
      },
      h(Avatar.Fallback, null, (state) => `${state.size}`),
    ),
  );
  assert.ok(avatar().classList.contains('status-error'));
  assert.ok(avatar().classList.contains('shape-square'));
  assert.equal(avatar().textContent, 'tiny');
  assert.equal(avatar().dataset.shape, 'square');
});

test('Avatar.Image takes its own src and native attributes', async () => {
  await render(
    h(
      Avatar,
      { name: 'Alice Kim' },
      h(Avatar.Image, { src: '/own.png', referrerPolicy: 'no-referrer', loading: 'eager' }),
    ),
  );
  assert.equal(image().getAttribute('src'), '/own.png');
  assert.equal(image().getAttribute('referrerpolicy'), 'no-referrer');
  assert.equal(image().getAttribute('loading'), 'eager');
  assert.equal(avatar().dataset.status, 'loading');
});

test('initials: Korean family name, two Latin words, graphemes and punctuation', () => {
  assert.equal(initialsOf('Alice Kim'), 'AK');
  assert.equal(initialsOf('ada lovelace king'), 'AL');
  assert.equal(initialsOf('류현승'), '류');
  assert.equal(initialsOf('홍 길동'), '홍');
  assert.equal(initialsOf('Émile Zola'), 'ÉZ');
  assert.equal(initialsOf('(주)아크메'), '주');
  assert.equal(initialsOf('🦊 Fox'), 'F');
  assert.equal(initialsOf('   '), '');
});

test('parts outside Avatar throw', () => {
  assert.throws(() => renderToString(h(Avatar.Fallback)), /inside `<Avatar>`/);
});
