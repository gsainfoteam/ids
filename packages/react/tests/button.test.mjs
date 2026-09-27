import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const name of ['window', 'document', 'HTMLElement', 'Event', 'KeyboardEvent', 'MouseEvent'])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Button, ButtonGroup } = await import('../dist/index.js');

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
const first = (selector) => host.querySelector(selector);
const key = (target, type, value) =>
  act(async () => {
    target.dispatchEvent(new KeyboardEvent(type, { key: value, bubbles: true, cancelable: true }));
  });

test('SSR: a native button that never submits by accident and names its variant and size', () => {
  const doc = new JSDOM(renderToString(h(Button, { colorScheme: 'danger', size: 'tiny' }, '삭제')))
    .window.document;
  const button = doc.querySelector('button');
  assert.equal(button.type, 'button');
  assert.equal(button.dataset.variant, 'solid');
  assert.equal(button.dataset.size, 'tiny');
  assert.match(button.className, /\[--control-fill:var\(--ids-color-danger\)\]/);
  assert.equal(button.textContent, '삭제');
});

test('type defaults to button inside a form; type="submit" submits', async () => {
  const submits = [];
  await render(
    h(
      'form',
      {
        onSubmit: (event) => {
          event.preventDefault();
          submits.push('submit');
        },
      },
      h(Button, null, '미리보기'),
      h(Button, { type: 'submit', id: 'submit' }, '제출'),
    ),
  );
  await act(async () => first('button').click());
  assert.deepEqual(submits, []);
  await act(async () => first('#submit').click());
  assert.deepEqual(submits, ['submit']);
});

test('disabled uses the native attribute and blocks clicks', async () => {
  let clicks = 0;
  await render(h(Button, { disabled: true, onClick: () => clicks++ }, '저장'));
  const button = first('button');
  assert.equal(button.disabled, true);
  assert.ok(button.hasAttribute('data-disabled'));
  await act(async () => button.click());
  assert.equal(clicks, 0);
});

test('focusableWhenDisabled keeps focus and the tab stop but blocks clicks, keys and submit', async () => {
  let clicks = 0;
  let submits = 0;
  await render(
    h(
      'form',
      {
        onSubmit: (event) => {
          event.preventDefault();
          submits++;
        },
      },
      h(
        Button,
        { type: 'submit', disabled: true, focusableWhenDisabled: true, onClick: () => clicks++ },
        '저장 중',
      ),
    ),
  );
  const button = first('button');
  assert.equal(button.disabled, false);
  assert.equal(button.getAttribute('aria-disabled'), 'true');
  assert.equal(button.tabIndex, 0);
  button.focus();
  assert.equal(document.activeElement, button);
  await act(async () => button.click());
  assert.equal(clicks, 0);
  assert.equal(submits, 0);
  const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
  await act(async () => button.dispatchEvent(enter));
  assert.equal(enter.defaultPrevented, true);
});

test('asChild renders the child with the button style; the child class and handlers go first', async () => {
  const events = [];
  const refs = [];
  await render(
    h(
      Button,
      {
        asChild: true,
        variant: 'outline',
        ref: (node) => refs.push(['root', node?.tagName]),
        onClick: () => events.push('root'),
      },
      h(
        'a',
        {
          href: '#docs',
          className: 'px-8',
          ref: (node) => refs.push(['child', node?.tagName]),
          onClick: (event) => {
            event.preventDefault();
            events.push('child');
          },
        },
        '문서',
      ),
    ),
  );
  const link = first('a');
  assert.equal(link.getAttribute('href'), '#docs');
  assert.equal(link.hasAttribute('type'), false);
  assert.equal(link.dataset.variant, 'outline');
  assert.ok(link.classList.contains('px-8'));
  assert.equal(link.classList.contains('px-4'), false);
  assert.deepEqual(
    refs.filter(([, tag]) => tag),
    [
      ['root', 'A'],
      ['child', 'A'],
    ],
  );
  await act(async () => link.click());
  assert.deepEqual(events, ['child']);
});

test('a disabled asChild link drops href and the tab stop and blocks every click', async () => {
  const fail = () => assert.fail('disabled link was activated');
  await render(
    h(
      Button,
      { asChild: true, disabled: true, onClick: fail },
      h('a', { href: '#danger', onClick: fail }, '준비 중'),
    ),
  );
  const link = first('a');
  assert.equal(link.hasAttribute('href'), false);
  assert.equal(link.getAttribute('role'), 'link');
  assert.equal(link.getAttribute('aria-disabled'), 'true');
  assert.equal(link.tabIndex, -1);
  await act(async () => link.click());
});

test('a disabled router component keeps the href it may require; its click is blocked', async () => {
  const Link = ({ ref, ...props }) => h('a', { ...props, ref });
  let clicks = 0;
  await render(
    h(
      Button,
      { asChild: true, disabled: true, onClick: () => clicks++ },
      h(Link, { href: '/settings', onClick: () => clicks++ }, '설정'),
    ),
  );
  const link = first('a');
  assert.equal(link.getAttribute('href'), '/settings');
  assert.equal(link.hasAttribute('type'), false);
  assert.equal(link.getAttribute('aria-disabled'), 'true');
  assert.equal(link.tabIndex, -1);
  const click = new MouseEvent('click', { bubbles: true, cancelable: true });
  await act(async () => link.dispatchEvent(click));
  assert.equal(click.defaultPrevented, true);
  assert.equal(clicks, 0);
});

test('asChild on a plain element adds button semantics and keyboard activation', async () => {
  let clicks = 0;
  await render(h(Button, { asChild: true, onClick: () => clicks++ }, h('span', null, '카드')));
  const span = first('span');
  assert.equal(span.getAttribute('role'), 'button');
  assert.equal(span.tabIndex, 0);
  await key(span, 'keydown', 'Enter');
  assert.equal(clicks, 1);
  const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
  await act(async () => span.dispatchEvent(space));
  assert.equal(space.defaultPrevented, true);
  assert.equal(clicks, 1);
  await key(span, 'keyup', ' ');
  assert.equal(clicks, 2);
});

test('className, children and variant accept a function of the interaction state', async () => {
  await render(
    h(Button, {
      variant: (state) => (state.focusVisible ? 'solid' : 'ghost'),
      className: (state) => (state.focused ? 'is-focused' : undefined),
      children: (state) => (state.focusVisible ? '키보드' : '기본'),
    }),
  );
  const button = first('button');
  assert.equal(button.textContent, '기본');
  assert.equal(button.dataset.variant, 'ghost');
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    button.focus();
  });
  assert.equal(button.textContent, '키보드');
  assert.equal(button.dataset.variant, 'solid');
  assert.ok(button.classList.contains('is-focused'));
  assert.ok(button.hasAttribute('data-focus-visible'));
});

test('a group size reaches its buttons unless a button sets its own', async () => {
  await render(
    h(
      ButtonGroup,
      { size: 'tiny' },
      h(Button, { id: 'inherit' }, '가'),
      h(Button, { id: 'own', size: 'standard' }, '나'),
    ),
  );
  assert.equal(first('#inherit').dataset.size, 'tiny');
  assert.equal(first('#own').dataset.size, 'standard');
});
