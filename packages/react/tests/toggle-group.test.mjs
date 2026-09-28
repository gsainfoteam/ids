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
  'HTMLButtonElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'FormData',
])
  globalThis[name] = dom.window[name];
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
function stubVisibilityForTabbable() {
  dom.window.Element.prototype.checkVisibility ??= () => true;
}
stubVisibilityForTabbable();
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Toggle, ToggleGroup } = await import('../dist/index.js');

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
const items = () => [...host.querySelectorAll('[data-toggle-group-item]')];
const named = (text) => items().find((item) => item.textContent === text);
const press = (key, target = document.activeElement, init = {}) =>
  act(async () => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
    );
  });
const click = (target) => act(async () => target.click());
const focus = (target) => act(async () => target.focus());

function group(props, values = ['a', 'b', 'c'], itemProps = {}) {
  return h(
    ToggleGroup,
    { 'aria-label': '그룹', ...props },
    values.map((value) => h(Toggle, { key: value, value, ...itemProps[value] }, value)),
  );
}

const resetSettles = () => new Promise((resolve) => setTimeout(resolve));

test('SSR: a single group is a named radiogroup; every item stays tabbable until measured', () => {
  const doc = new JSDOM(renderToString(group({ defaultValue: 'b', name: 'pick' }))).window.document;
  const radiogroup = doc.querySelector('[role="radiogroup"]');
  assert.equal(radiogroup.getAttribute('aria-label'), '그룹');
  assert.equal(radiogroup.getAttribute('aria-orientation'), 'horizontal');
  const radios = [...doc.querySelectorAll('[role="radio"]')];
  assert.deepEqual(
    radios.map((radio) => radio.getAttribute('aria-checked')),
    ['false', 'true', 'false'],
  );
  assert.equal(radios[0].hasAttribute('aria-pressed'), false);
  assert.equal(radios[0].hasAttribute('tabindex'), false);
  assert.equal(doc.querySelector('input[type="hidden"][name="pick"]').value, 'b');
});

test('single: Tab lands on the checked item, or the first enabled one', async () => {
  await render(group({ defaultValue: 'b' }));
  assert.deepEqual(
    items().map((item) => item.tabIndex),
    [-1, 0, -1],
  );
  await render(group({}, ['a', 'b', 'c'], { a: { disabled: true } }));
  assert.deepEqual(
    items().map((item) => item.getAttribute('tabindex')),
    ['-1', '0', '-1'],
  );
});

test('single: arrow keys move focus and the check together, skip disabled items and loop', async () => {
  const changes = [];
  const clicks = [];
  await render(
    group(
      { defaultValue: 'a', onValueChange: (next) => changes.push(next) },
      ['a', 'b', 'c', 'd'],
      {
        b: { disabled: true },
        c: { onClick: () => clicks.push('c') },
      },
    ),
  );
  await focus(named('a'));
  await press('ArrowRight');
  assert.equal(document.activeElement, named('c'));
  assert.equal(named('c').getAttribute('aria-checked'), 'true');
  await press('ArrowDown');
  assert.equal(document.activeElement, named('d'));
  await press('ArrowRight');
  assert.equal(document.activeElement, named('a'));
  await press('End');
  assert.equal(document.activeElement, named('d'));
  await press('Home');
  assert.equal(document.activeElement, named('a'));
  assert.deepEqual(changes, ['c', 'd', 'a', 'd', 'a']);
  assert.deepEqual(clicks, ['c']);
  await press('ArrowRight', document.activeElement, { ctrlKey: true });
  assert.equal(document.activeElement, named('a'));
});

test('an inert item is passed over like a disabled one', async () => {
  await render(group({ defaultValue: 'a' }, ['a', 'b', 'c'], { b: { inert: true } }));
  await focus(named('a'));
  await press('ArrowRight');
  assert.equal(document.activeElement, named('c'));
});

test('loop={false} stops at the ends, and the arrow key is still consumed', async () => {
  await render(group({ defaultValue: 'c', loop: false }));
  await focus(named('c'));
  const event = new KeyboardEvent('keydown', {
    key: 'ArrowRight',
    bubbles: true,
    cancelable: true,
  });
  await act(async () => named('c').dispatchEvent(event));
  assert.equal(document.activeElement, named('c'));
  assert.equal(event.defaultPrevented, true);
});

test('right-to-left swaps the left and right arrows', async () => {
  await render(h('div', { dir: 'rtl' }, group({ defaultValue: 'a' })));
  await focus(named('a'));
  await press('ArrowLeft');
  assert.equal(document.activeElement, named('b'));
});

test('single: clicking the checked item clears it unless the group is required', async () => {
  const changes = [];
  await render(group({ defaultValue: 'a', onValueChange: (next) => changes.push(next) }));
  await click(named('a'));
  assert.equal(named('a').getAttribute('aria-checked'), 'false');
  assert.deepEqual(changes, [null]);
  await render(group({ defaultValue: 'a', required: true }));
  await click(named('a'));
  assert.equal(named('a').getAttribute('aria-checked'), 'true');
});

test('multiple: a toolbar of pressed buttons whose arrows move focus only', async () => {
  const changes = [];
  await render(group({ selectionMode: 'multiple', onValueChange: (next) => changes.push(next) }));
  const toolbar = host.querySelector('[role="toolbar"]');
  assert.ok(toolbar);
  assert.equal(named('a').getAttribute('aria-pressed'), 'false');
  assert.equal(named('a').hasAttribute('role'), false);
  await focus(named('a'));
  await press('ArrowRight');
  assert.equal(document.activeElement, named('b'));
  assert.equal(named('b').getAttribute('aria-pressed'), 'false');
  assert.deepEqual(
    items().map((item) => item.tabIndex),
    [-1, 0, -1],
  );
  await press('ArrowDown');
  assert.equal(document.activeElement, named('b'));
  await click(named('c'));
  await click(named('a'));
  assert.deepEqual(changes, [['c'], ['a', 'c']]);
});

test('vertical toolbar moves on up and down only', async () => {
  await render(group({ selectionMode: 'multiple', orientation: 'vertical' }));
  await focus(named('a'));
  await press('ArrowRight');
  assert.equal(document.activeElement, named('a'));
  await press('ArrowDown');
  assert.equal(document.activeElement, named('b'));
});

test('controlled: null clears a single group', async () => {
  function Controlled() {
    const [value, setValue] = useState('a');
    return h(
      'div',
      null,
      group({ value, onValueChange: setValue }),
      h('button', { id: 'clear', onClick: () => setValue(null) }, 'clear'),
    );
  }
  await render(h(Controlled));
  await click(named('b'));
  assert.equal(named('b').getAttribute('aria-checked'), 'true');
  await click(host.querySelector('#clear'));
  assert.deepEqual(
    items().map((item) => item.getAttribute('aria-checked')),
    ['false', 'false', 'false'],
  );
});

test('form: one entry per pressed value, a required validator, and reset to the default', async () => {
  const changes = [];
  await render(
    h(
      'form',
      null,
      group({ name: 'size', required: true, onValueChange: (next) => changes.push(next) }),
      group({ name: 'tags', selectionMode: 'multiple', defaultValue: ['x'] }, ['x', 'y', 'z']),
    ),
  );
  const form = host.querySelector('form');
  const validator = host.querySelector('[data-form-value-validator]');
  assert.equal(validator.required, true);
  assert.equal(validator.checkValidity(), false);
  await click(named('b'));
  await click(named('z'));
  await click(named('y'));
  const data = new FormData(form);
  assert.equal(data.get('size'), 'b');
  assert.deepEqual(data.getAll('tags'), ['x', 'y', 'z']);
  assert.equal(host.querySelector('[data-form-value-validator]').checkValidity(), true);
  await act(async () => {
    form.reset();
    await resetSettles();
    await Promise.resolve();
  });
  const reset = new FormData(form);
  assert.equal(reset.get('size'), null);
  assert.deepEqual(reset.getAll('tags'), ['x']);
  assert.deepEqual(
    changes,
    ['b'],
    'a native reset fires no change event, so neither does the group',
  );
});

test('form names a form elsewhere in the document', async () => {
  await render(
    h(
      'div',
      null,
      h('form', { id: 'order' }),
      group({ name: 'pick', form: 'order', defaultValue: 'c' }),
    ),
  );
  assert.equal(new FormData(host.querySelector('#order')).get('pick'), 'c');
  assert.equal(named('a').getAttribute('form'), 'order');
});

test('a disabled group disables its items and leaves the form', async () => {
  await render(h('form', null, group({ name: 'pick', defaultValue: 'a', disabled: true })));
  assert.ok(items().every((item) => item.disabled));
  assert.equal(new FormData(host.querySelector('form')).get('pick'), null);
  assert.equal(host.querySelector('[role="radiogroup"]').getAttribute('aria-disabled'), 'true');
});

test('a value of the wrong shape is read leniently', async () => {
  await render(group({ defaultValue: ['b', 'c'] }));
  assert.equal(named('b').getAttribute('aria-checked'), 'true');
  assert.equal(named('c').getAttribute('aria-checked'), 'false');
  await render(null);
  await render(group({ selectionMode: 'multiple', defaultValue: 'c' }));
  assert.equal(named('c').getAttribute('aria-pressed'), 'true');
});
