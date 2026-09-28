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
  'HTMLInputElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'FocusEvent',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, Fragment, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Field, TextField } = await import('../dist/index.js');
const { Field: RhfField } = await import('../dist/react-hook-form.js');
const { FormProvider, useForm } = await import('react-hook-form');
let root;
let host;
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
const control = () => host.querySelector('input');
const shell = () => host.querySelector('[data-text-field]');
const clearButton = () => host.querySelector('[data-text-control-clear]');
const has = (node, name) => node.hasAttribute(`data-${name}`);
async function input(value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(control(), value);
    control().dispatchEvent(new Event('input', { bubbles: true }));
  });
}

const resetSettles = () => new Promise((resolve) => setTimeout(resolve));

test('Input values win over root values, but root and Input handlers both run', async () => {
  const changes = [];
  await render(
    h(
      TextField,
      { id: 'root-id', name: 'root', onChange: () => changes.push('root') },
      h(TextField.Input, { name: 'input', onChange: () => changes.push('input') }),
    ),
  );
  assert.equal(control().id, 'root-id');
  assert.equal(control().name, 'input');
  await input('a');
  assert.deepEqual(changes, ['root', 'input']);
});

test('sentinel inside a Fragment splits leading and trailing adornments', async () => {
  await render(
    h(
      TextField,
      { 'aria-label': 'Search' },
      h(Fragment, null, h('span', null, 'Lead'), h(TextField.Input), h('span', null, 'Trail')),
    ),
  );
  assert.deepEqual(
    Array.from(host.querySelector('[data-text-field]').children, (el) =>
      'textFieldAdornment' in el.dataset ? el.textContent : el.tagName,
    ),
    ['Lead', 'INPUT', 'Trail'],
  );
});

test('asChild merges props and ref into the child input', async () => {
  let node;
  const changes = [];
  await render(
    h(
      TextField,
      {
        name: 'q',
        onChange: () => changes.push('root'),
        ref: (value) => {
          node = value;
        },
      },
      h(
        TextField.Input,
        { asChild: true },
        h('input', { spellCheck: false, onChange: () => changes.push('child') }),
      ),
    ),
  );
  assert.equal(node, control());
  assert.equal(control().name, 'q');
  assert.equal(control().getAttribute('spellcheck'), 'false');
  assert.ok('textFieldInput' in control().dataset);
  await input('a');
  assert.deepEqual(changes, ['child', 'root']);
});

test('invalid structures fail clearly', () => {
  for (const node of [
    h(TextField, null, h(TextField.Input), h(TextField.Input)),
    h(TextField, null, h(TextField.Input, { asChild: true }, h('textarea'))),
    h(TextField, null, h(TextField.Input, null, 'text')),
  ])
    assert.throws(() => renderToString(node), /\[IDS\] `<TextField/);
});

test('the shell carries the input state; the input is marked for focus-ring', async () => {
  await render(h(TextField, { 'aria-label': 'Name', invalid: true }));
  assert.ok(has(control(), 'field-input'));
  assert.ok(has(shell(), 'invalid'), 'invalid reaches the shell, not only the input');
  assert.equal(control().getAttribute('aria-invalid'), 'true');
  await render(h(Field, { invalid: true, 'aria-label': 'Name' }, h(TextField)));
  assert.ok(has(shell(), 'invalid'), 'an invalid Field marks the shell');
  await render(h(TextField, { 'aria-label': 'Name', readOnly: true, defaultValue: 'x' }));
  assert.ok(has(shell(), 'readonly'));
  assert.ok(has(shell(), 'filled'));
  await act(async () => control().focus());
  assert.ok(has(shell(), 'focused'));
  await act(async () => control().blur());
  assert.equal(has(shell(), 'focused'), false);
});

test('onValueChange reports the string next to the native onChange event', async () => {
  const events = [];
  await render(
    h(TextField, {
      'aria-label': 'Name',
      onChange: (event) => events.push(['change', event.target.value]),
      onValueChange: (value) => events.push(['value', value]),
    }),
  );
  await input('ab');
  assert.deepEqual(events, [
    ['change', 'ab'],
    ['value', 'ab'],
  ]);
  let set;
  const calls = [];
  function Controlled() {
    const [value, setValue] = useState('first');
    set = setValue;
    return h(TextField, { 'aria-label': 'Name', value, onValueChange: (next) => calls.push(next) });
  }
  await render(h(Controlled, { key: 'controlled' }));
  await act(async () => set('from parent'));
  assert.equal(control().value, 'from parent');
  assert.deepEqual(calls, [], 'a value set by code is not reported back');
});

test('Clear shows only while filled, clears through a real input event and keeps focus', async () => {
  const values = [];
  await render(
    h(
      TextField,
      { 'aria-label': 'Search', onValueChange: (value) => values.push(value) },
      h(TextField.Input),
      h(TextField.Clear),
    ),
  );
  assert.equal(clearButton(), null);
  await input('ids');
  assert.ok(has(shell(), 'filled'));
  assert.equal(clearButton().getAttribute('aria-label'), '지우기');
  assert.equal(clearButton().tabIndex, -1);
  assert.equal(clearButton().getAttribute('aria-controls'), control().id);
  await act(async () => clearButton().click());
  assert.equal(control().value, '');
  assert.deepEqual(values, ['ids', '']);
  assert.equal(document.activeElement, control());
  assert.equal(clearButton(), null);
  await render(
    h(
      TextField,
      { 'aria-label': 'Search', defaultValue: 'keep', readOnly: true },
      h(TextField.Input),
      h(TextField.Clear),
    ),
  );
  assert.equal(clearButton(), null, 'a read-only field has nothing to clear');
});

test('Escape clears a clearable field and lets the key through once it is empty', async () => {
  await render(
    h(
      TextField,
      { 'aria-label': 'Search', defaultValue: 'ids' },
      h(TextField.Input),
      h(TextField.Clear),
    ),
  );
  const press = async () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    await act(async () => control().dispatchEvent(event));
    return event;
  };
  assert.equal((await press()).defaultPrevented, true);
  assert.equal(control().value, '');
  assert.equal((await press()).defaultPrevented, false);
  await render(h(TextField, { key: 'plain', 'aria-label': 'Plain', defaultValue: 'ids' }));
  assert.equal((await press()).defaultPrevented, false, 'without a Clear part Escape is untouched');
  assert.equal(control().value, 'ids');
});

test('a direct write to input.value (react-hook-form setValue) shows Clear and fills the Field', async () => {
  let methods;
  function App() {
    methods = useForm({ defaultValues: { query: '' } });
    return h(
      FormProvider,
      methods,
      h(
        RhfField,
        { name: 'query', 'aria-label': 'Query' },
        h(TextField, null, h(TextField.Input), h(TextField.Clear)),
      ),
    );
  }
  await render(h(App));
  assert.equal(clearButton(), null);
  await act(async () => {
    methods.setValue('query', 'from code');
    await Promise.resolve();
  });
  assert.equal(control().value, 'from code');
  assert.ok(clearButton(), 'Clear follows a value written without an input event');
  assert.ok(has(host.querySelector('[data-field]'), 'filled'));
  await act(async () => clearButton().click());
  assert.equal(methods.getValues('query'), '', 'register() sees the clear');
});

test('native form reset hides Clear again', async () => {
  await render(
    h(
      'form',
      null,
      h(TextField, { 'aria-label': 'Search', name: 'q' }, h(TextField.Input), h(TextField.Clear)),
    ),
  );
  await input('typed');
  assert.ok(clearButton());
  await act(async () => {
    host.querySelector('form').reset();
    await resetSettles();
    await Promise.resolve();
  });
  assert.equal(control().value, '');
  assert.equal(clearButton(), null);
});

test('pressing the shell padding focuses the input; buttons keep their own presses', async () => {
  await render(
    h(
      TextField,
      { 'aria-label': 'Search' },
      h('span', null, 'Lead'),
      h(TextField.Input),
      h('button', { type: 'button' }, 'Act'),
    ),
  );
  const down = (target) => {
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 });
    target.dispatchEvent(event);
    return event;
  };
  let event;
  await act(async () => (event = down(host.querySelector('[data-text-field-adornment]'))));
  assert.equal(event.defaultPrevented, true);
  assert.equal(document.activeElement, control());
  await act(async () => control().blur());
  await act(async () => (event = down(host.querySelector('button'))));
  assert.equal(event.defaultPrevented, false);
  assert.notEqual(document.activeElement, control());
});

test('className and style accept a function of the field state', async () => {
  await render(
    h(TextField, {
      'aria-label': 'Name',
      className: (state) => (state.filled ? 'has-value' : 'empty'),
      style: (state) => ({ opacity: state.focused ? 1 : 0.5 }),
    }),
  );
  assert.ok(shell().classList.contains('empty'));
  assert.equal(shell().style.opacity, '0.5');
  await act(async () => control().focus());
  await input('a');
  assert.ok(shell().classList.contains('has-value'));
  assert.equal(shell().style.opacity, '1');
});

test('a ref callback is attached once, not again on every keystroke', async () => {
  let attached = 0;
  let detached = 0;
  const ref = (node) => {
    if (!node) return;
    attached++;
    return () => detached++;
  };
  await render(h(TextField, { 'aria-label': 'Name', ref }, h(TextField.Input), h(TextField.Clear)));
  await input('a');
  await input('ab');
  assert.equal(attached, 1);
  assert.equal(detached, 0);
});
