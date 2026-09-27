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
  'MouseEvent',
  'MutationObserver',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Label, Field } = await import('../dist/index.js');

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
const label = () => host.querySelector('label');
const flush = () => act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

test('SSR: a native label with an id, a required marker hidden from screen readers', () => {
  const doc = new JSDOM(renderToString(h(Label, { htmlFor: 'name', required: true }, 'Name')))
    .window.document;
  const element = doc.querySelector('label');
  assert.equal(element.htmlFor, 'name');
  assert.ok(element.id);
  assert.ok(element.hasAttribute('data-required'));
  const marker = element.querySelector('[data-label-required]');
  assert.equal(marker.textContent, '*');
  assert.equal(marker.getAttribute('aria-hidden'), 'true');
  assert.match(element.className, /text-body-b3-medium/);
});

test('the label mirrors its native control, and follows later changes', async () => {
  await render(
    h(
      'div',
      null,
      h(Label, { htmlFor: 'nick' }, 'Nickname'),
      h('input', { id: 'nick', required: true }),
    ),
  );
  await flush();
  assert.ok(label().hasAttribute('data-required'));
  assert.ok(label().querySelector('[data-label-required]'));
  assert.equal(label().hasAttribute('data-disabled'), false);
  await act(async () => {
    host.querySelector('input').disabled = true;
  });
  await flush();
  assert.ok(label().hasAttribute('data-disabled'));
  assert.equal(host.querySelector('input').hasAttribute('aria-labelledby'), false);
});

test('explicit props win over the control', async () => {
  await render(
    h(
      'div',
      null,
      h(Label, { htmlFor: 'x', required: false, disabled: true }, 'X'),
      h('input', { id: 'x', required: true }),
    ),
  );
  await flush();
  assert.equal(label().hasAttribute('data-required'), false);
  assert.ok(label().hasAttribute('data-disabled'));
});

test('a role widget gets a name by reference and focus on click', async () => {
  await render(
    h(
      'div',
      null,
      h(Label, { htmlFor: 'volume' }, 'Volume'),
      h('span', { id: 'volume' }, h('span', { role: 'slider', tabIndex: 0, 'aria-valuenow': 3 })),
    ),
  );
  await flush();
  const slider = host.querySelector('[role="slider"]');
  assert.equal(slider.getAttribute('aria-labelledby'), label().id);
  await act(async () => label().click());
  assert.equal(document.activeElement, slider);
});

test('a checkbox-like widget toggles when its label is clicked, unless disabled', async () => {
  const clicks = [];
  await render(
    h(
      Label,
      null,
      h('span', {
        role: 'switch',
        tabIndex: 0,
        'aria-checked': false,
        onClick: () => clicks.push('switch'),
      }),
      'Dark mode',
    ),
  );
  await flush();
  await act(async () => label().click());
  assert.deepEqual(clicks, ['switch']);
  await act(async () => host.querySelector('[role="switch"]').click());
  assert.deepEqual(clicks, ['switch', 'switch'], 'a click on the widget itself is not doubled');

  await render(
    h(
      Label,
      { key: 'disabled' },
      h('span', {
        role: 'switch',
        tabIndex: 0,
        'aria-disabled': true,
        onClick: () => clicks.push('disabled'),
      }),
      'Off',
    ),
  );
  await flush();
  assert.ok(label().hasAttribute('data-disabled'));
  await act(async () => label().click());
  assert.equal(clicks.includes('disabled'), false);
});

test('an existing name is kept, and the reference is removed with the label', async () => {
  function App() {
    const [shown, setShown] = useState(true);
    App.hide = () => setShown(false);
    return h(
      'div',
      null,
      shown && h(Label, { htmlFor: 'a' }, 'A'),
      h('div', { id: 'a', role: 'slider', tabIndex: 0 }),
      h('div', { id: 'b', role: 'slider', tabIndex: 0, 'aria-label': 'Own' }),
      h(Label, { htmlFor: 'b' }, 'B'),
    );
  }
  await render(h(App));
  await flush();
  assert.ok(host.querySelector('#a').hasAttribute('aria-labelledby'));
  assert.equal(host.querySelector('#b').hasAttribute('aria-labelledby'), false);
  await act(async () => App.hide());
  assert.equal(host.querySelector('#a').hasAttribute('aria-labelledby'), false);
});

test('className and style read the state', async () => {
  await render(
    h(
      'div',
      null,
      h(
        Label,
        {
          htmlFor: 'r',
          className: (state) => (state.required ? 'is-required' : 'is-optional'),
          style: (state) => ({ opacity: state.disabled ? 0.5 : 1 }),
        },
        'R',
      ),
      h('input', { id: 'r', required: true }),
    ),
  );
  await flush();
  assert.match(label().className, /is-required/);
  assert.equal(label().style.opacity, '1');
});

test('invalid is set directly, not read from the control', async () => {
  await render(
    h(
      'div',
      null,
      h(
        Label,
        {
          htmlFor: 'e',
          invalid: true,
          className: (state) => (state.invalid ? 'is-invalid' : 'is-valid'),
        },
        'E',
      ),
      h(Label, { htmlFor: 'f' }, 'F'),
      h('input', { id: 'e' }),
      h('input', { id: 'f', 'aria-invalid': true }),
    ),
  );
  await flush();
  const [explicit, mirrored] = host.querySelectorAll('label');
  assert.ok(explicit.hasAttribute('data-invalid'));
  assert.match(explicit.className, /is-invalid/);
  assert.match(explicit.className, /data-invalid:text-\(--ids-color-danger\)/);
  assert.equal(mirrored.hasAttribute('data-invalid'), false);
});

test('asChild draws the label as its child element, with the id and handler it carries', async () => {
  const clicks = [];
  await render(
    h(
      'div',
      null,
      h(
        Label,
        { asChild: true, htmlFor: 'level', required: true },
        h('span', { id: 'own', className: 'own', onClick: () => clicks.push('child') }, 'Level'),
      ),
      h('div', { id: 'level', role: 'slider', tabIndex: 0, 'aria-valuenow': 3 }),
    ),
  );
  await flush();
  const span = host.querySelector('span[data-label]');
  assert.equal(span.id, 'own');
  assert.match(span.className, /own/);
  assert.match(span.className, /text-body-b3-medium/);
  assert.equal(span.querySelector('[data-label-required]').textContent, '*');
  const slider = host.querySelector('[role="slider"]');
  assert.equal(slider.getAttribute('aria-labelledby'), 'own');
  await act(async () => span.click());
  assert.deepEqual(clicks, ['child']);
  assert.equal(document.activeElement, slider);
  assert.throws(() => renderToString(h(Label, { asChild: true }, 'Level')), /Label asChild/);
});

test('inside a Field it still renders', () => {
  const html = renderToString(
    h(
      Field,
      null,
      h(Field.Label, null, 'Name'),
      h('input'),
      h(Field.Hint, null, h(Label, null, 'x')),
    ),
  );
  assert.match(html, /data-label/);
});
