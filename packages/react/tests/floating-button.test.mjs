import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const key of ['window', 'document', 'HTMLElement', 'Event', 'KeyboardEvent', 'MouseEvent'])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { FloatingButton } = await import('../dist/index.js');
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
const button = () => host.querySelector('[data-floating-button]');
test('native defaults avoid form submit; nested visible text produces extended action', async () => {
  let clicks = 0,
    submits = 0;
  await render(
    h(
      'form',
      {
        onSubmit: (e) => {
          e.preventDefault();
          submits++;
        },
      },
      h(FloatingButton, { onClick: () => clicks++ }, h('span', null, '작성')),
    ),
  );
  assert.equal(button().type, 'button');
  assert.equal(button().hasAttribute('data-icon-only'), false);
  await act(async () => button().click());
  assert.equal(clicks, 1);
  assert.equal(submits, 0);
});
test('SSR icon-only name can come from explicit icon title; caller name wins', () => {
  for (const label of [undefined, '추가하기']) {
    const doc = new JSDOM(
      renderToString(h(FloatingButton, { 'aria-label': label }, h('svg', { title: '추가' }))),
    ).window.document;
    const node = doc.querySelector('button');
    assert.equal(node.getAttribute('aria-label'), label ?? '추가');
    assert.ok(node.hasAttribute('data-icon-only'));
  }
});
test('asChild forwards both refs with cleanup and composes child/root handlers', async () => {
  const events = [];
  let childRef,
    rootRef,
    cleanups = 0;
  await render(
    h(
      FloatingButton,
      {
        asChild: true,
        ref: (node) => {
          rootRef = node;
          return () => cleanups++;
        },
        onClick: () => events.push('root'),
      },
      h(
        'a',
        {
          href: '#test',
          ref: (node) => {
            childRef = node;
            return () => cleanups++;
          },
          onClick: () => events.push('child'),
        },
        '새 글',
      ),
    ),
  );
  assert.equal(button(), rootRef);
  assert.equal(button(), childRef);
  assert.equal(button().tagName, 'A');
  await act(async () => button().click());
  assert.deepEqual(events, ['child', 'root']);
  await render(null);
  assert.equal(cleanups, 2);
});
test('child cancellation prevents root action', async () => {
  await render(
    h(
      FloatingButton,
      { asChild: true, onClick: () => assert.fail('canceled') },
      h('button', { onClick: (e) => e.preventDefault() }, '취소'),
    ),
  );
  await act(async () => button().click());
});
test('disabled links remove href and block child/root keyboard and click actions', async () => {
  const fail = () => assert.fail('disabled handler');
  await render(
    h(
      FloatingButton,
      { asChild: true, disabled: true, onClick: fail, onKeyDown: fail },
      h('a', { href: '#danger', onClick: fail, onKeyDown: fail }, '비활성'),
    ),
  );
  assert.equal(button().hasAttribute('href'), false);
  assert.equal(button().getAttribute('role'), 'link');
  assert.equal(button().tabIndex, -1);
  assert.equal(button().getAttribute('aria-disabled'), 'true');
  await act(async () => {
    button().click();
    button().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
  });
});
test('render props update interaction state and keyboard focus remains visible', async () => {
  await render(h(FloatingButton, null, (state) => (state.focusVisible ? '키보드 포커스' : '실행')));
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    button().focus();
  });
  assert.equal(button().textContent, '키보드 포커스');
  assert.ok(button().hasAttribute('data-focus-visible'));
});
