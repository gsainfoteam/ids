import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const key of [
  'window',
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'FocusEvent',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Select, Field } = await import('../dist/index.js');

let root, host;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = undefined;
  host?.remove();
  delete window.matchMedia;
  delete window.visualViewport;
});
async function render(node) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(() => root.render(node));
}

const items = () => [
  h(Select.Item, { key: 'a', value: 'apple' }, 'Apple'),
  h(Select.Item, { key: 'b', value: 'banana', disabled: true }, 'Banana'),
  h(Select.Item, { key: 'c', value: 'cherry' }, 'Cherry'),
];
const trigger = () => host.querySelector('[data-select] [role=combobox]');
const listbox = () => host.querySelector('[role=listbox]');
const options = () => [...host.querySelectorAll('[role=option]')];
const active = () => document.getElementById(trigger().getAttribute('aria-activedescendant'));
async function key(node, key, init = {}) {
  await act(() =>
    node.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
    ),
  );
}
async function click(node) {
  await act(() => node.click());
}
async function type(node, value) {
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
function tracked(props = {}, children = items()) {
  const changes = [];
  const opens = [];
  return {
    changes,
    opens,
    node: h(
      Select,
      {
        'aria-label': 'Fruit',
        ...props,
        onValueChange: (value) => changes.push(value),
        onOpenChange: (open) => opens.push(open),
      },
      ...children,
    ),
  };
}

test('SSR: Field labelling, size, invalid, one hidden input per value and diagnostics', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { size: 'tiny', invalid: true, required: true },
          h(Field.Label, null, 'Fruit'),
          h(
            Select,
            { name: 'fruit', selectionMode: 'multiple', defaultValue: ['cherry', 'apple'] },
            ...items(),
          ),
          h(Field.Error, null, 'Error'),
        ),
      ),
    ),
  ).window.document;
  const button = doc.querySelector('[role=combobox]');
  assert.equal(button.id, doc.querySelector('label').htmlFor);
  assert.equal(button.type, 'button');
  assert.equal(button.getAttribute('aria-invalid'), 'true');
  assert.equal(button.getAttribute('aria-required'), 'true');
  assert.equal(button.getAttribute('aria-haspopup'), 'listbox');
  assert.ok(button.textContent.includes('Cherry, Apple'));
  const rootNode = doc.querySelector('[data-select]');
  assert.equal(rootNode.dataset.size, 'tiny');
  assert.ok(rootNode.hasAttribute('data-invalid'));
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form'))],
    [
      ['fruit', 'cherry'],
      ['fruit', 'apple'],
    ],
  );
  assert.equal(doc.querySelectorAll('[data-form-value-validator]').length, 1);
  assert.throws(
    () =>
      renderToString(
        h(Select, null, h(Select.Item, { value: 'a' }), h(Select.Item, { value: 'a' })),
      ),
    /duplicate/,
  );
  assert.throws(
    () => renderToString(h(Select, { selectionMode: 'multiple', value: 'bad' })),
    /string/,
  );
  assert.throws(
    () => renderToString(h(Select, null, h(Select.Content), h(Select.Item, { value: 'x' }, 'X'))),
    /either inside Select.Content or directly/,
  );
});

test('keyboard: opens on the selection, skips disabled items, does not wrap, pages and commits', async () => {
  const state = tracked({ defaultValue: 'cherry' });
  await render(state.node);
  await key(trigger(), 'ArrowDown');
  assert.ok(listbox());
  assert.equal(active().textContent, 'Cherry', 'opens on the selected option');
  await key(trigger(), 'ArrowDown');
  assert.equal(active().textContent, 'Cherry', 'the last option does not wrap');
  await key(trigger(), 'ArrowUp');
  assert.equal(active().textContent, 'Apple', 'the disabled option is skipped');
  await key(trigger(), 'PageDown');
  assert.equal(active().textContent, 'Cherry');
  await key(trigger(), 'Home');
  await key(trigger(), 'Enter');
  assert.deepEqual(state.changes, ['apple']);
  assert.equal(listbox(), null);
  assert.equal(document.activeElement, trigger());
  await key(trigger(), 'End');
  assert.equal(active().textContent, 'Cherry', 'End opens on the last option');
  await key(trigger(), 'Escape');
  assert.equal(listbox(), null);
  assert.deepEqual(state.changes, ['apple'], 'Escape does not commit');
  await key(trigger(), 'ArrowDown');
  await key(trigger(), 'ArrowDown');
  await key(trigger(), 'ArrowUp', { altKey: true });
  assert.deepEqual(state.changes, ['apple', 'cherry'], 'Alt+ArrowUp commits and closes');
  assert.equal(listbox(), null);
  assert.deepEqual(state.opens, [true, false, true, false, true, false]);
});

test('typeahead: a typed prefix jumps, a repeated letter cycles, a space continues the prefix', async () => {
  await render(
    tracked({}, [
      h(Select.Item, { key: 1, value: 'b1' }, 'Blueberry'),
      h(Select.Item, { key: 2, value: 'b2' }, 'Banana'),
      h(Select.Item, { key: 3, value: 'n1' }, 'New York'),
      h(Select.Item, { key: 4, value: 'n2' }, 'New Delhi'),
      h(Select.Item, { key: 5, value: 'b3' }, 'Blackberry'),
    ]).node,
  );
  await key(trigger(), 'b');
  assert.ok(listbox(), 'typing on a closed trigger opens the list');
  assert.equal(active().textContent, 'Banana', 'the first b after the current option');
  await key(trigger(), 'b');
  assert.equal(active().textContent, 'Blackberry', 'repeating the letter cycles');
  await key(trigger(), 'b');
  assert.equal(active().textContent, 'Blueberry');
  await new Promise((resolve) => setTimeout(resolve, 550));
  for (const char of 'new d') await key(trigger(), char);
  assert.equal(active().textContent, 'New Delhi', 'a space inside a prefix is typed, not pressed');
});

test('search, live empty state, multiple toggles in list order, outside dismissal and reset', async () => {
  const state = tracked({ name: 'fruit', selectionMode: 'multiple', defaultValue: ['apple'] }, [
    h(Select.SearchField, { key: 's' }),
    ...items(),
    h(Select.Empty, { key: 'e' }, 'No fruit'),
  ]);
  await render(h('form', null, state.node, h('button', { type: 'reset' }, 'Reset')));
  await click(trigger());
  const search = host.querySelector('input[role=combobox]');
  assert.equal(document.activeElement, search, 'the search field takes focus');
  const status = host.querySelector('[role=status]');
  assert.equal(status.textContent, '', 'the live region is mounted but silent');
  await type(search, 'xyz');
  assert.equal(host.querySelector('[role=status]').textContent, 'No fruit');
  assert.equal(options().length, 0);
  await type(search, 'CH');
  assert.equal(search.getAttribute('aria-activedescendant'), options()[0].id);
  await key(search, 'Enter');
  assert.deepEqual(state.changes.at(-1), ['apple', 'cherry']);
  assert.ok(listbox(), 'multiple selection stays open');
  await type(search, '');
  await click(options()[1]);
  assert.equal(state.changes.length, 1, 'a disabled option cannot be chosen');
  await click(options()[0]);
  assert.deepEqual(state.changes.at(-1), ['cherry']);
  await click(options()[0]);
  assert.deepEqual(state.changes.at(-1), ['apple', 'cherry'], 'values follow the list order');
  await key(search, 'Tab');
  assert.equal(listbox(), null);
  await act(async () => {
    host.querySelector('form').reset();
    await Promise.resolve();
  });
  assert.deepEqual(
    [...host.querySelectorAll('input[type=hidden]')].map((node) => node.value),
    ['apple'],
  );
  assert.deepEqual(state.changes.at(-1), ['apple'], 'reset reports the restored value');
  await click(trigger());
  await act(() => document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })));
  assert.equal(listbox(), null);
  assert.equal(state.opens.at(-1), false, 'an outside click reports the close');
});

test('options show a check when selected, and state reaches data attributes and functions', async () => {
  await render(
    h(
      Select,
      { 'aria-label': 'Status', defaultValue: 'b', defaultOpen: true },
      h(Select.Item, { value: 'a' }, 'A'),
      h(
        Select.Item,
        { value: 'b', className: (s) => (s.selected ? 'is-selected' : 'is-not') },
        (s) => `B ${s.highlighted ? 'lit' : 'dark'}`,
      ),
      h(
        Select.Item,
        { value: 'c', label: 'C' },
        'Custom',
        h(Select.ItemIndicator, { className: 'mine' }, '*'),
      ),
    ),
  );
  const [a, b] = options();
  assert.equal(a.querySelector('[data-select-item-indicator]'), null);
  assert.ok(b.querySelector('[data-select-item-indicator] svg'), 'the default check');
  assert.ok(b.hasAttribute('data-selected') && b.hasAttribute('data-highlighted'));
  assert.ok(b.className.includes('is-selected'));
  assert.equal(b.firstChild.textContent, 'B lit');
  await click(options()[2]);
  assert.ok(trigger().textContent.includes('C'), 'the label prop is what the trigger shows');
  await click(trigger());
  const custom = options()[2];
  assert.equal(custom.querySelectorAll('[data-select-item-indicator]').length, 1);
  assert.ok(custom.querySelector('[data-select-item-indicator]').className.includes('mine'));
});

test('multiple values read as two labels and a count that never truncates', async () => {
  await render(
    h(
      Select,
      { 'aria-label': 'Fruits', selectionMode: 'multiple', defaultValue: ['a', 'b', 'c', 'd'] },
      ...['a', 'b', 'c', 'd'].map((value) =>
        h(Select.Item, { key: value, value }, value.toUpperCase()),
      ),
    ),
  );
  const value = host.querySelector('[data-select-value]');
  assert.equal(value.children[0].textContent, 'A, B');
  assert.equal(value.children[1].textContent, '+2');
  await render(
    h(
      Select,
      { key: 'custom', 'aria-label': 'Fruits', selectionMode: 'multiple', defaultValue: ['a'] },
      h(
        Select.Trigger,
        null,
        h(Select.Value, null, (state) => `${state.labels.length} picked`),
      ),
      h(Select.Item, { value: 'a' }, 'A'),
    ),
  );
  assert.equal(trigger().textContent, '1 picked');
});

test('Clear returns a single select to null and focuses the trigger; hidden when read-only', async () => {
  const state = tracked({ defaultValue: 'apple' }, [h(Select.Clear, { key: 'x' }), ...items()]);
  await render(state.node);
  const clear = host.querySelector('[data-select-clear]');
  assert.equal(clear.getAttribute('aria-label'), '선택 지우기');
  await click(clear);
  assert.deepEqual(state.changes, [null]);
  assert.equal(document.activeElement, trigger());
  assert.equal(host.querySelector('[data-select-clear]'), null);
  assert.ok(trigger().textContent.includes('선택하세요'));
  await render(
    h(
      Select,
      { 'aria-label': 'Fruit', value: 'apple', readOnly: true },
      h(Select.Clear),
      ...items(),
    ),
  );
  assert.equal(host.querySelector('[data-select-clear]'), null);
});

test('required is enforced natively and the browser is sent to the trigger', async () => {
  let submitted = 0;
  await render(
    h(
      'form',
      { onSubmit: (event) => (event.preventDefault(), submitted++) },
      h(Select, { 'aria-label': 'Fruit', name: 'fruit', required: true }, ...items()),
    ),
  );
  const form = host.querySelector('form');
  const validator = host.querySelector('[data-form-value-validator]');
  assert.equal(form.checkValidity(), false);
  assert.equal(validator.validity.valueMissing, true);
  await act(() => validator.focus());
  assert.equal(document.activeElement, trigger(), 'focus moves on to the real control');
  await click(trigger());
  await click(options()[0]);
  assert.equal(form.checkValidity(), true);
  assert.deepEqual([...new window.FormData(form)], [['fruit', 'apple']]);
  await render(
    h(
      'form',
      null,
      h(Select, { 'aria-label': 'Fruit', required: true, readOnly: true }, ...items()),
    ),
  );
  assert.equal(host.querySelector('form').checkValidity(), true, 'read-only is not validated');
});

test('open, defaultOpen and onOpenChange; disabled and read-only never open', async () => {
  function Controlled() {
    const [open, setOpen] = useState(true);
    return h(
      'div',
      null,
      h('button', { id: 'outside', onClick: () => setOpen(true) }, 'Open'),
      h(Select, { 'aria-label': 'Fruit', open, onOpenChange: setOpen }, ...items()),
    );
  }
  await render(h(Controlled));
  assert.ok(listbox(), 'starts open');
  await key(trigger(), 'Escape');
  assert.equal(listbox(), null);
  await click(host.querySelector('#outside'));
  assert.ok(listbox());
  const state = tracked({ readOnly: true, value: 'apple' });
  await render(state.node);
  await click(trigger());
  await key(trigger(), 'ArrowDown');
  assert.equal(listbox(), null);
  assert.equal(trigger().getAttribute('aria-readonly'), 'true');
  await render(tracked({ disabled: true, value: 'cherry', defaultOpen: true }).node);
  assert.equal(trigger().disabled, true);
  assert.equal(listbox(), null);
  assert.ok(trigger().textContent.includes('Cherry'));
  assert.deepEqual(state.changes, []);
});

test('react-hook-form value mode binds onValueChange, focuses on error, resets and omits disabled', async () => {
  const { Field: F } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({ defaultValues: { fruit: null } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { onSubmit: methods.handleSubmit((v) => (result = v)) },
        h(
          F,
          {
            name: 'fruit',
            controlMode: 'value',
            registerOptions: { required: 'Choose fruit' },
            disabled,
          },
          h(F.Label, null, 'Fruit'),
          h(Select, null, ...items()),
          h(F.Error),
        ),
      ),
    );
  }
  await render(h(App));
  const submit = () =>
    act(async () =>
      host
        .querySelector('form')
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
    );
  await submit();
  assert.equal(document.activeElement, trigger());
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Choose fruit');
  await click(trigger());
  await click(options()[0]);
  assert.equal(methods.getValues('fruit'), 'apple');
  await submit();
  assert.deepEqual(result, { fruit: 'apple' });
  await act(async () => methods.reset());
  assert.ok(trigger().textContent.includes('선택하세요'));
  await act(async () => methods.setValue('fruit', 'cherry'));
  assert.ok(trigger().textContent.includes('Cherry'));
  await render(h(App, { disabled: true }));
  await submit();
  assert.equal(result.fruit, undefined);
});

test('asChild Content and Group still collect items; an empty string is a value', async () => {
  const state = tracked({}, [
    h(Select.Trigger, { key: 't', asChild: true }, h('button', null, 'Open')),
    h(
      Select.Content,
      { key: 'c', asChild: true },
      h(
        'section',
        null,
        h(
          Select.Group,
          { heading: 'Values', asChild: true },
          h('section', null, h(Select.Item, { value: '' }, 'Empty')),
        ),
      ),
    ),
  ]);
  await render(state.node);
  await click(host.querySelector('[role=combobox]'));
  assert.equal(options().length, 1);
  assert.equal(host.querySelector('[role=group]').tagName, 'SECTION');
  await key(host.querySelector('[role=combobox]'), 'Enter');
  assert.deepEqual(state.changes, ['']);
  assert.equal(listbox(), null);
});

test('the list opens centered on the selection and later moves scroll only the popup', async () => {
  const rects = new Map();
  const original = dom.window.HTMLElement.prototype.getBoundingClientRect;
  dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
    return rects.get(this.textContent) ?? rects.get(this.dataset.fieldPopup) ?? original.call(this);
  };
  try {
    await render(tracked({ defaultValue: 'cherry' }).node);
    const popupRect = { top: 100, bottom: 300, height: 200 };
    rects.set('', popupRect);
    rects.set('Cherry', { top: 380, bottom: 420, height: 40 });
    rects.set('Apple', { top: 60, bottom: 100, height: 40 });
    Object.defineProperties(dom.window.HTMLElement.prototype, {
      clientHeight: { configurable: true, get: () => 200 },
    });
    await click(trigger());
    const popup = host.querySelector('[data-field-popup]');
    assert.equal(popup.scrollTop, 200, 'centered: 380 - 100 - (200 - 40) / 2');
    popup.scrollTop = 100;
    await key(trigger(), 'ArrowUp');
    assert.equal(active().textContent, 'Apple');
    assert.equal(popup.scrollTop, 60, 'scrolled just far enough: 100 + (60 - 100)');
  } finally {
    dom.window.HTMLElement.prototype.getBoundingClientRect = original;
    delete dom.window.HTMLElement.prototype.clientHeight;
  }
});

test('the popup flips above a trigger near the bottom and stays inside the viewport', async () => {
  let popupHeight = 300;
  Object.defineProperty(dom.window.HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
      return this.hasAttribute('data-field-popup') ? popupHeight : 0;
    },
  });
  try {
    await render(tracked().node);
    host.querySelector('[data-select]').getBoundingClientRect = () => ({
      top: 700,
      bottom: 736,
      left: 900,
      right: 1100,
      width: 200,
      height: 36,
    });
    await click(trigger());
    const popup = host.querySelector('[data-field-popup]');
    assert.equal(popup.dataset.side, 'top');
    assert.equal(popup.style.top, `${700 - 4 - 300}px`);
    assert.equal(popup.style.width, '240px', 'at least the preferred width');
    assert.equal(popup.style.left, `${1024 - 8 - 240}px`, 'shifted back inside the viewport');
    popupHeight = 150;
    await act(() => window.dispatchEvent(new Event('resize')));
    assert.equal(popup.dataset.side, 'top', 'a shorter list keeps the side it opened on');
    assert.equal(popup.style.top, `${700 - 4 - 150}px`);
  } finally {
    delete dom.window.HTMLElement.prototype.offsetHeight;
  }
});

test('drawer on a small screen is a modal dialog: backdrop, focus inside, Tab held, scroll locked', async () => {
  window.matchMedia = () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  });
  window.visualViewport = {
    height: 500,
    offsetTop: 0,
    addEventListener() {},
    removeEventListener() {},
  };
  const state = tracked({ mobileVariant: 'drawer', defaultValue: 'cherry' });
  await render(h('div', null, h('button', null, 'Before'), state.node));
  await click(trigger());
  const popup = host.querySelector('[data-field-popup]');
  assert.equal(popup.dataset.presentation, 'drawer');
  assert.ok(
    popup.style.bottom.includes(`${window.innerHeight - 500}px`),
    'lifted by the part the on-screen keyboard covers',
  );
  assert.equal(popup.getAttribute('role'), 'dialog');
  assert.equal(popup.getAttribute('aria-modal'), 'true');
  assert.equal(popup.getAttribute('aria-label'), 'Fruit');
  assert.ok(host.querySelector('[data-field-popup-backdrop]'));
  assert.equal(document.documentElement.style.overflow, 'hidden');
  assert.equal(document.activeElement, listbox(), 'focus moves into the sheet');
  assert.equal(listbox().getAttribute('aria-activedescendant'), options()[2].id);
  await key(listbox(), 'ArrowUp');
  assert.equal(listbox().getAttribute('aria-activedescendant'), options()[0].id);
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  await act(() => listbox().dispatchEvent(tab));
  assert.equal(tab.defaultPrevented, true, 'Tab cannot leave the sheet');
  await act(() =>
    host
      .querySelector('[data-field-popup-backdrop]')
      .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })),
  );
  assert.equal(listbox(), null);
  assert.equal(document.activeElement, trigger(), 'the backdrop closes and returns focus');
  assert.equal(document.documentElement.style.overflow, '');
  assert.deepEqual(state.changes, []);
});

test('search ignores case, width and accents; IME keys are left alone', async () => {
  await render(
    tracked({}, [
      h(Select.SearchField, { key: 's' }),
      h(Select.Item, { key: 'ci', value: 'ci' }, "Côte d'Ivoire"),
      h(Select.Item, { key: 'cu', value: 'cu' }, 'Cuba'),
    ]).node,
  );
  await click(trigger());
  const search = host.querySelector('input[role=combobox]');
  await type(search, 'COTE');
  assert.deepEqual(
    options().map((option) => option.textContent),
    ["Côte d'Ivoire"],
  );
  await type(search, 'ｃｕｂａ');
  assert.deepEqual(
    options().map((option) => option.textContent),
    ['Cuba'],
  );
  await type(search, '');
  const before = search.getAttribute('aria-activedescendant');
  await key(search, 'ArrowDown', { isComposing: true });
  await key(search, 'ArrowDown', { keyCode: 229 });
  assert.equal(search.getAttribute('aria-activedescendant'), before);
});

test('the list is named by the field label; onBlur waits until focus leaves trigger and popup', async () => {
  let blurs = 0;
  await render(
    h(
      'div',
      null,
      h(
        Field,
        null,
        h(Field.Label, null, 'Fruit'),
        h(Select, { onBlur: () => blurs++ }, h(Select.SearchField), ...items()),
      ),
      h('button', { id: 'after' }, 'After'),
    ),
  );
  await act(() => trigger().focus());
  await click(trigger());
  const search = host.querySelector('input[role=combobox]');
  assert.equal(document.activeElement, search);
  assert.equal(listbox().getAttribute('aria-labelledby'), host.querySelector('label').id);
  assert.equal(blurs, 0, 'moving into the popup is not a blur');
  await act(() => host.querySelector('#after').focus());
  assert.equal(listbox(), null, 'focus leaving a popover closes it');
  assert.equal(blurs, 1);
});

test('form attribute, disabled omission and a value that is not an option yet', async () => {
  await render(
    h(
      'div',
      null,
      h('form', { id: 'outer' }),
      h(
        Select,
        { 'aria-label': 'Fruit', name: 'fruit', form: 'outer', defaultValue: 'apple' },
        ...items(),
      ),
      h(Select, { 'aria-label': 'Later', defaultValue: 'durian' }, ...items()),
    ),
  );
  assert.deepEqual([...new window.FormData(host.querySelector('#outer'))], [['fruit', 'apple']]);
  assert.equal(host.querySelectorAll('[data-select]')[1].textContent, 'durian');
  await render(
    h(
      'form',
      { key: 'disabled' },
      h(
        Select,
        { 'aria-label': 'Fruit', name: 'fruit', disabled: true, defaultValue: 'apple' },
        ...items(),
      ),
    ),
  );
  assert.deepEqual([...new window.FormData(host.querySelector('form'))], []);
});
