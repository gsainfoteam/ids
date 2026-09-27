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
  'HTMLElement',
  'Node',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'requestAnimationFrame',
  'cancelAnimationFrame',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Alert } = await import('../dist/index.js');

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
// The exit waits one animation frame for its transitions; jsdom has none, so one frame is enough.
const frame = () => act(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
const alert = () => host.querySelector('[data-alert]');
async function escape(target, init = {}) {
  let event;
  await act(async () => {
    event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
      ...init,
    });
    target.dispatchEvent(event);
  });
  return event;
}

const html = (node) => new JSDOM(renderToString(node)).window.document;

test('role follows the meaning: warning and danger interrupt, the rest wait', () => {
  for (const [colorScheme, role, live] of [
    ['neutral', 'status', 'polite'],
    ['info', 'status', 'polite'],
    ['success', 'status', 'polite'],
    ['warning', 'alert', 'assertive'],
    ['danger', 'alert', 'assertive'],
  ]) {
    const element = html(h(Alert, { colorScheme }, h(Alert.Title, null, 'x'))).querySelector(
      '[data-alert]',
    );
    assert.equal(element.getAttribute('role'), role, colorScheme);
    assert.equal(element.getAttribute('aria-live'), live, colorScheme);
    assert.equal(element.dataset.colorScheme, colorScheme);
  }
  const note = html(h(Alert, { colorScheme: 'danger', role: 'note' })).querySelector(
    '[data-alert]',
  );
  assert.equal(note.getAttribute('role'), 'note');
  assert.equal(note.hasAttribute('aria-live'), false);
});

test('a default icon per meaning, none for neutral unless asked, hidden removes it', () => {
  const icon = (props, ...children) =>
    html(h(Alert, props, h(Alert.Title, null, 'x'), ...children)).querySelector(
      '[data-alert-icon]',
    );
  assert.ok(icon({ colorScheme: 'danger' })?.querySelector('svg'));
  assert.equal(icon({ colorScheme: 'danger' }).getAttribute('aria-hidden'), 'true');
  assert.equal(icon({ colorScheme: 'neutral' }), null);
  assert.ok(icon({ colorScheme: 'neutral' }, h(Alert.Icon))?.querySelector('svg'));
  assert.equal(icon({ colorScheme: 'info' }, h(Alert.Icon, { hidden: true })), null);
  const custom = icon({}, h(Alert.Icon, null, h('i', { id: 'glyph' })));
  assert.ok(custom.querySelector('#glyph'));
});

test('the icon, content and close button land in their own columns', () => {
  const doc = html(
    h(
      Alert,
      { variant: 'outline' },
      h(Alert.Close),
      h(Alert.Title, null, 'Title'),
      h(Alert.Description, null, 'Body'),
    ),
  );
  const [first, content, last] = [...doc.querySelector('[data-alert]').children];
  assert.ok(first.hasAttribute('data-alert-icon'));
  assert.equal(content.textContent, 'TitleBody');
  assert.ok(last.hasAttribute('data-alert-close'));
  assert.equal(last.getAttribute('aria-label'), '닫기');
  assert.equal(last.getAttribute('type'), 'button');
  assert.match(
    doc.querySelector('[data-alert]').className,
    /grid-cols-\[auto_minmax\(0,1fr\)_auto\]/,
  );
});

test('uncontrolled: Close hides it, focus moves on to the next element', async () => {
  const changes = [];
  await render(
    h(
      'div',
      null,
      h(
        Alert,
        { onOpenChange: (open) => changes.push(open) },
        h(Alert.Title, null, 'Saved'),
        h(Alert.Close),
      ),
      h('button', { id: 'after' }, 'After'),
    ),
  );
  const close = host.querySelector('[data-alert-close]');
  await act(async () => {
    close.focus();
    close.click();
  });
  assert.deepEqual(changes, [false]);
  assert.equal(document.activeElement.id, 'after');
  assert.ok(alert()?.hasAttribute('data-ending-style'), 'stays mounted while it fades');
  await frame();
  assert.equal(alert(), null);
});

test('focus falls back to the element before when nothing follows', async () => {
  await render(
    h(
      'div',
      null,
      h('button', { id: 'before' }, 'Before'),
      h(Alert, null, h(Alert.Title, null, 'x'), h(Alert.Close)),
    ),
  );
  const close = host.querySelector('[data-alert-close]');
  await act(async () => {
    close.focus();
    close.click();
  });
  assert.equal(document.activeElement.id, 'before');
});

test('Escape inside closes, except while composing or when already handled', async () => {
  await render(h(Alert, null, h(Alert.Title, null, 'x'), h('input'), h(Alert.Close)));
  const input = host.querySelector('input');
  input.focus();
  await escape(input, { isComposing: true });
  assert.ok(alert() && !alert().hasAttribute('data-ending-style'), 'composition keeps it open');
  await render(
    h(
      Alert,
      { key: 'b', onKeyDown: (event) => event.preventDefault() },
      h(Alert.Title, null, 'x'),
      h(Alert.Close),
    ),
  );
  await escape(host.querySelector('[data-alert-close]'));
  assert.equal(alert().hasAttribute('data-ending-style'), false, 'a handled Escape is left alone');
  await render(h(Alert, { key: 'c' }, h(Alert.Title, null, 'x'), h(Alert.Close)));
  const event = await escape(host.querySelector('[data-alert-close]'));
  assert.equal(event.defaultPrevented, true);
  await frame();
  assert.equal(alert(), null);
});

test('without Alert.Close, Escape does nothing', async () => {
  await render(h(Alert, null, h(Alert.Title, null, 'x'), h('button', null, 'Action')));
  const event = await escape(host.querySelector('button'));
  assert.equal(event.defaultPrevented, false);
  await frame();
  assert.ok(alert());
});

test('controlled: the parent decides, and reopening works', async () => {
  let setOpen;
  function App() {
    const [open, set] = useState(true);
    setOpen = set;
    return h(Alert, { open, onOpenChange: set }, h(Alert.Title, null, 'x'), h(Alert.Close));
  }
  await render(h(App));
  await act(async () => host.querySelector('[data-alert-close]').click());
  await frame();
  assert.equal(alert(), null);
  await act(async () => setOpen(true));
  assert.ok(alert());
  assert.equal(alert().hasAttribute('data-ending-style'), false);
});

test('a Close onClick that prevents default keeps the alert open', async () => {
  const changes = [];
  await render(
    h(
      Alert,
      { onOpenChange: (open) => changes.push(open) },
      h(Alert.Title, null, 'x'),
      h(Alert.Close, { onClick: (event) => event.preventDefault() }),
    ),
  );
  await act(async () => host.querySelector('[data-alert-close]').click());
  assert.deepEqual(changes, []);
  assert.ok(alert());
});

test('className and style read the state; parts accept asChild', () => {
  const doc = html(
    h(
      Alert,
      {
        colorScheme: 'success',
        variant: 'solid',
        className: (state) => `${state.variant}-${state.dismissible}`,
        style: (state) => ({ opacity: state.open ? 1 : 0 }),
      },
      h(Alert.Title, { asChild: true }, h('h3', null, 'Done')),
      h(Alert.Close),
    ),
  );
  const element = doc.querySelector('[data-alert]');
  assert.match(element.className, /solid-true/);
  assert.equal(element.style.opacity, '1');
  assert.equal(element.dataset.variant, 'solid');
  assert.ok(element.hasAttribute('data-dismissible'));
  assert.ok(doc.querySelector('h3[data-alert-title]'));
});

test('defaultOpen false renders nothing', () => {
  assert.equal(renderToString(h(Alert, { defaultOpen: false }, h(Alert.Title, null, 'x'))), '');
});
