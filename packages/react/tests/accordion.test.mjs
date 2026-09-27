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
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Accordion } = await import('../dist/index.js');

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
const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 20)));

const triggers = () => [...host.querySelectorAll('[data-accordion-trigger]')];
const panelOf = (trigger) => document.getElementById(trigger.getAttribute('aria-controls'));
const expanded = () => triggers().map((trigger) => trigger.getAttribute('aria-expanded'));
// Closing panels settle on a zero-length timer in jsdom, which has no transitions.
const click = (element) =>
  act(async () => {
    element.click();
    await new Promise((resolve) => setTimeout(resolve, 5));
  });
const key = (element, key, init = {}) =>
  act(async () => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
  });

function items(values = ['a', 'b', 'c'], extra = {}) {
  return values.map((value) =>
    h(
      Accordion.Item,
      { key: value, value, ...(extra[value] ?? {}) },
      h(Accordion.Trigger, null, `Section ${value}`),
      h(Accordion.Content, null, h('button', { type: 'button' }, `Inside ${value}`)),
    ),
  );
}

test('SSR: each header is a heading with a button that controls a labelled region', () => {
  const doc = new JSDOM(
    renderToString(h(Accordion, { type: 'single', defaultValue: 'a', headingLevel: 2 }, items())),
  ).window.document;
  const buttons = [...doc.querySelectorAll('h2 > button[data-accordion-trigger]')];
  assert.equal(buttons.length, 3);
  const [first, second] = buttons;
  assert.equal(first.getAttribute('aria-expanded'), 'true');
  assert.equal(second.getAttribute('aria-expanded'), 'false');
  const region = doc.getElementById(first.getAttribute('aria-controls'));
  assert.equal(region.getAttribute('role'), 'region');
  assert.equal(region.getAttribute('aria-labelledby'), first.id);
  assert.equal(region.hasAttribute('hidden'), false);
  assert.equal(
    doc.getElementById(second.getAttribute('aria-controls')).hasAttribute('hidden'),
    true,
  );
  assert.ok(first.querySelector('[data-accordion-indicator] svg'), 'a default chevron is drawn');
  assert.equal(first.dataset.state, 'open');
  assert.ok(first.hasAttribute('data-open'));
  assert.equal(doc.querySelector('[data-accordion]').dataset.variant, 'outline');
});

test('single: one open at a time, a second press closes it when collapsible', async () => {
  const changes = [];
  await render(
    h(Accordion, { type: 'single', onValueChange: (value) => changes.push(value) }, items()),
  );
  const [a, b] = triggers();
  await click(a);
  await click(b);
  assert.deepEqual(expanded(), ['false', 'true', 'false']);
  await click(b);
  assert.deepEqual(expanded(), ['false', 'false', 'false']);
  assert.deepEqual(changes, ['a', 'b', null]);
});

test('single, not collapsible: the open header is aria-disabled and stays open', async () => {
  const changes = [];
  await render(
    h(
      Accordion,
      {
        type: 'single',
        collapsible: false,
        defaultValue: 'a',
        onValueChange: (value) => changes.push(value),
      },
      items(),
    ),
  );
  const [a, b] = triggers();
  assert.equal(a.getAttribute('aria-disabled'), 'true');
  assert.equal(a.disabled, false, 'it stays focusable');
  await click(a);
  assert.deepEqual(expanded(), ['true', 'false', 'false']);
  assert.deepEqual(changes, []);
  await click(b);
  assert.equal(a.hasAttribute('aria-disabled'), false);
  assert.equal(b.getAttribute('aria-disabled'), 'true');
});

test('multiple: controlled value opens several items and follows the parent', async () => {
  let set;
  const changes = [];
  function App() {
    const [value, setValue] = useState(['a']);
    set = setValue;
    return h(
      Accordion,
      {
        type: 'multiple',
        value,
        onValueChange: (next) => {
          changes.push(next);
          setValue(next);
        },
      },
      items(),
    );
  }
  await render(h(App));
  await click(triggers()[2]);
  assert.deepEqual(expanded(), ['true', 'false', 'true']);
  await click(triggers()[0]);
  assert.deepEqual(changes, [['a', 'c'], ['c']]);
  await act(async () => set(['a', 'b', 'c']));
  await settle();
  assert.deepEqual(expanded(), ['true', 'true', 'true']);
});

test('keyboard: arrows wrap, Home/End jump, disabled headers and nested accordions are skipped', async () => {
  await render(
    h(
      Accordion,
      { type: 'multiple', defaultValue: ['a'] },
      h(
        Accordion.Item,
        { value: 'a' },
        h(Accordion.Trigger, null, 'A'),
        h(
          Accordion.Content,
          null,
          h(
            Accordion,
            { type: 'single' },
            h(Accordion.Item, { value: 'inner' }, h(Accordion.Trigger, null, 'Inner')),
          ),
        ),
      ),
      h(Accordion.Item, { value: 'b', disabled: true }, h(Accordion.Trigger, null, 'B')),
      h(Accordion.Item, { value: 'c' }, h(Accordion.Trigger, null, 'C')),
    ),
  );
  const [a, inner, b, c] = triggers();
  assert.equal(b.disabled, true);
  await act(async () => a.focus());
  await key(a, 'ArrowDown');
  assert.equal(document.activeElement, c);
  await key(c, 'ArrowDown');
  assert.equal(document.activeElement, a, 'wraps to the first header');
  await key(a, 'ArrowUp');
  assert.equal(document.activeElement, c);
  await key(c, 'Home');
  assert.equal(document.activeElement, a);
  await key(a, 'End');
  assert.equal(document.activeElement, c);
  await key(c, 'ArrowUp', { metaKey: true });
  assert.equal(document.activeElement, c, 'modified keys are left to the browser');
  await act(async () => inner.focus());
  await key(inner, 'ArrowDown');
  assert.equal(
    document.activeElement,
    inner,
    'the nested accordion only moves between its own headers',
  );
});

test('a closed panel stays findable: hidden="until-found", and beforematch opens it', async () => {
  const changes = [];
  await render(
    h(
      Accordion,
      { type: 'single', defaultValue: 'a', onValueChange: (value) => changes.push(value) },
      items(['a', 'b', 'c'], { c: { disabled: true } }),
    ),
  );
  const [, b, c] = triggers();
  assert.equal(panelOf(b).getAttribute('hidden'), 'until-found');
  assert.equal(panelOf(c).getAttribute('hidden'), '', 'a disabled item is not searchable');
  await act(async () => {
    panelOf(b).dispatchEvent(new Event('beforematch', { bubbles: true }));
  });
  assert.deepEqual(expanded(), ['false', 'true', 'false']);
  assert.equal(panelOf(b).hasAttribute('hidden'), false);
  assert.deepEqual(changes, ['b']);
});

test('closing: the panel is inert while it collapses, then hidden until found', async () => {
  await render(h(Accordion, { type: 'single', defaultValue: 'a' }, items()));
  const [a] = triggers();
  const panel = panelOf(a);
  await act(async () => a.click());
  assert.equal(panel.hasAttribute('inert'), true);
  assert.equal(panel.hasAttribute('hidden'), false, 'still visible so the height can animate');
  assert.equal(panel.dataset.state, 'closed');
  await settle();
  assert.equal(panel.hasAttribute('inert'), false);
  assert.equal(panel.getAttribute('hidden'), 'until-found');
});

test('focus inside a panel that closes goes back to its header', async () => {
  let set;
  function App() {
    const [value, setValue] = useState('a');
    set = setValue;
    return h(Accordion, { type: 'single', value, onValueChange: setValue }, items());
  }
  await render(h(App));
  const inside = host.querySelector('[data-accordion-content] button');
  await act(async () => inside.focus());
  assert.equal(document.activeElement, inside);
  await act(async () => set(null));
  assert.equal(document.activeElement, triggers()[0]);
});

test('disabled root disables every header; parts render state through functions', async () => {
  const seen = [];
  await render(
    h(
      Accordion,
      { type: 'multiple', disabled: true, defaultValue: ['a'] },
      h(
        Accordion.Item,
        { value: 'a', className: (state) => (state.open ? 'is-open' : 'is-closed') },
        h(Accordion.Trigger, null, (state) => {
          seen.push(state);
          return `A ${state.disabled ? 'off' : 'on'}`;
        }),
        h(Accordion.Content, null, 'Body'),
      ),
    ),
  );
  const [a] = triggers();
  assert.equal(a.disabled, true);
  assert.equal(a.textContent, 'A off');
  assert.ok(host.querySelector('[data-accordion-item]').classList.contains('is-open'));
  assert.equal(seen.at(-1).value, 'a');
  assert.equal(seen.at(-1).open, true);
  assert.ok(host.querySelector('[data-accordion]').hasAttribute('data-disabled'));
});

test('a custom Indicator replaces the default chevron wherever it is placed', async () => {
  await render(
    h(
      Accordion,
      { type: 'single' },
      h(
        Accordion.Item,
        { value: 'a' },
        h(
          Accordion.Trigger,
          null,
          h(Accordion.Indicator, null, (state) => (state.open ? '-' : '+')),
          'Leading',
        ),
      ),
    ),
  );
  const [a] = triggers();
  assert.equal(a.querySelectorAll('[data-accordion-indicator]').length, 1);
  assert.equal(a.firstElementChild.textContent, '+');
  assert.equal(a.firstElementChild.getAttribute('aria-hidden'), 'true');
  await click(a);
  assert.equal(a.firstElementChild.textContent, '-');
});

test('parts outside their parents throw', () => {
  assert.throws(() => renderToString(h(Accordion.Item, { value: 'a' })), /inside `<Accordion>`/);
  assert.throws(
    () => renderToString(h(Accordion, { type: 'single' }, h(Accordion.Trigger, null, 'x'))),
    /inside `<Accordion.Item>`/,
  );
});
