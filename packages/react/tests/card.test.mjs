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
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'FocusEvent',
  'getComputedStyle',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Card } = await import('../dist/index.js');

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
const card = () => host.querySelector('[data-card]');
const key = (element, type, keyName, init = {}) =>
  act(async () => {
    element.dispatchEvent(new KeyboardEvent(type, { key: keyName, bubbles: true, ...init }));
  });

function anatomy(props = {}, extra = []) {
  return h(
    Card,
    props,
    h(
      Card.Header,
      null,
      h(Card.Title, null, 'Design review'),
      h(Card.Description, null, 'Today at 3pm'),
      h(Card.Action, null, h('button', { type: 'button' }, 'Copy')),
    ),
    h(Card.Content, null, 'Agenda'),
    h(Card.Footer, null, h('button', { type: 'button' }, 'Like')),
    ...extra,
  );
}

test('SSR: a static card has no role and every part marks itself', () => {
  const doc = new JSDOM(renderToString(anatomy())).window.document;
  const root = doc.querySelector('[data-card]');
  assert.equal(root.hasAttribute('role'), false);
  assert.equal(root.hasAttribute('tabindex'), false);
  assert.equal(root.hasAttribute('data-disabled'), false, 'static is not disabled');
  assert.equal(root.dataset.variant, 'outline');
  assert.ok(root.className.includes('concentric-p-4'));
  for (const part of ['header', 'title', 'description', 'action', 'content', 'footer'])
    assert.ok(doc.querySelector(`[data-card-${part}]`), part);
  assert.ok(
    doc
      .querySelector('[data-card-header]')
      .className.includes('has-[[data-card-action]]:grid-cols-[minmax(0,1fr)_auto]'),
  );
});

test('onClick makes it a button named by its title and described by its description', async () => {
  const clicks = [];
  await render(anatomy({ onClick: () => clicks.push('card') }));
  const element = card();
  assert.equal(element.getAttribute('role'), 'button');
  assert.equal(element.getAttribute('tabindex'), '0');
  const title = host.querySelector('[data-card-title]');
  const description = host.querySelector('[data-card-description]');
  assert.equal(element.getAttribute('aria-labelledby'), title.id);
  assert.equal(element.getAttribute('aria-describedby'), description.id);
  assert.ok(element.hasAttribute('data-interactive'));
});

test('Enter presses on key down; Space presses on key up, and not after focus leaves', async () => {
  let clicks = 0;
  await render(anatomy({ onClick: () => clicks++ }));
  const element = card();
  await key(element, 'keydown', 'Enter');
  assert.equal(clicks, 1);
  await key(element, 'keydown', 'Enter', { repeat: true });
  assert.equal(clicks, 2, 'a held Enter repeats like a native button');
  clicks = 1;
  await key(element, 'keydown', ' ');
  assert.equal(clicks, 1, 'space waits for key up');
  await key(element, 'keyup', ' ');
  assert.equal(clicks, 2);
  await key(element, 'keydown', ' ');
  await act(async () => {
    element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  });
  await key(element, 'keyup', ' ');
  assert.equal(clicks, 2, 'focus left before the key came up');
});

test('clicks and keys that start on a control inside the card stay with that control', async () => {
  let clicks = 0;
  await render(anatomy({ onClick: () => clicks++ }));
  const [copy, like] = host.querySelectorAll('button');
  await act(async () => like.click());
  await act(async () => copy.click());
  assert.equal(clicks, 0);
  await key(like, 'keydown', 'Enter');
  assert.equal(clicks, 0);
  await act(async () => host.querySelector('[data-card-content]').click());
  assert.equal(clicks, 1, 'text inside the card still opens it');
});

test('disabled: aria-disabled, out of the tab order, and no press', async () => {
  let clicks = 0;
  await render(anatomy({ onClick: () => clicks++, disabled: true }));
  const element = card();
  assert.equal(element.getAttribute('aria-disabled'), 'true');
  assert.equal(element.hasAttribute('tabindex'), false);
  assert.ok(element.hasAttribute('data-disabled'));
  await act(async () => element.click());
  await key(element, 'keydown', 'Enter');
  assert.equal(clicks, 0);
});

test('asChild: a link keeps its role, gains the states and is named by the title', async () => {
  const clicks = [];
  await render(
    h(
      Card,
      { asChild: true, className: (state) => (state.interactive ? 'is-interactive' : '') },
      h(
        'a',
        { href: '#review', onClick: (event) => (event.preventDefault(), clicks.push('link')) },
        h(Card.Header, null, h(Card.Title, null, 'Design review')),
      ),
    ),
  );
  const link = host.querySelector('a');
  assert.equal(link, card());
  assert.equal(link.hasAttribute('role'), false);
  assert.equal(link.hasAttribute('tabindex'), false);
  assert.ok(link.classList.contains('is-interactive'));
  assert.equal(link.getAttribute('aria-labelledby'), host.querySelector('[data-card-title]').id);
  await act(async () => link.click());
  assert.deepEqual(clicks, ['link']);
});

test('media bleeds to the edge and takes the corner where it touches one', async () => {
  const doc = new JSDOM(
    renderToString(h(Card, null, h(Card.Media, null, h('img', { src: '/a.png', alt: '' })))),
  ).window.document;
  const media = doc.querySelector('[data-card-media]');
  assert.ok(media.className.includes('first:rounded-t-[inherit]'));
  assert.ok(media.className.includes('-mx-[calc(var(--card-pad)_-_var(--card-ring))]'));
  assert.ok(doc.querySelector('[data-card]').className.includes('[--card-ring:1px]'));
  const soft = new JSDOM(renderToString(h(Card, { variant: 'soft' }))).window.document;
  assert.ok(soft.querySelector('[data-card]').className.includes('[--card-ring:0px]'));
});

test('parts outside Card throw', () => {
  assert.throws(() => renderToString(h(Card.Title, null, 'x')), /inside `<Card>`/);
});
