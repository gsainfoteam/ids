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
  'InputEvent',
  'KeyboardEvent',
  'CompositionEvent',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState, Fragment } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Field, OTPField } = await import('../dist/index.js');
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
const slots = () => [...host.querySelectorAll('[data-otp-slot]')];
const code = () =>
  slots()
    .map((input) => input.value)
    .join('');
async function key(index, key, options = {}) {
  let event;
  await act(async () => {
    slots()[index].focus();
    event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
    slots()[index].dispatchEvent(event);
  });
  return event;
}
async function type(index, value, options = {}) {
  await act(async () => {
    const node = slots()[index];
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
    node.dispatchEvent(new InputEvent('input', { bubbles: true, ...options }));
  });
}
async function paste(index, text) {
  let event;
  await act(async () => {
    event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    slots()[index].dispatchEvent(event);
  });
  return event;
}
function controlled(props = {}) {
  const changes = [],
    completions = [];
  let current, set;
  function App() {
    [current, set] = useState(props.defaultValue ?? '');
    return h(OTPField, {
      ...props,
      length: props.length ?? 6,
      value: current,
      onChange: (next) => {
        changes.push(next);
        set(next);
      },
      onComplete: (next) => completions.push(next),
    });
  }
  return { node: h(App), value: () => current, set: (next) => set(next), changes, completions };
}

test('SSR: Field group/slot names, label target, description/invalid/required, one canonical FormData value', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { required: true, invalid: true, size: 'tiny' },
          h(Field.Label, null, 'Verification'),
          h(Field.Description, null, 'Enter six digits'),
          h(OTPField, { length: 6, name: 'code', defaultValue: '123456' }),
          h(Field.Error, null, 'Expired'),
        ),
      ),
    ),
  ).window.document;
  const group = doc.querySelector('[role=group]'),
    inputs = [...doc.querySelectorAll('[data-otp-slot]')];
  assert.equal(inputs.length, 6);
  assert.equal(inputs[0].autocomplete, 'one-time-code');
  assert.equal(inputs[1].autocomplete, 'off');
  assert.equal(inputs[0].inputMode, 'numeric');
  assert.equal(doc.querySelector('label').htmlFor, inputs[0].id);
  assert.equal(group.getAttribute('aria-labelledby'), doc.querySelector('label').id);
  for (const [index, input] of inputs.entries()) {
    const name = input
      .getAttribute('aria-labelledby')
      .split(' ')
      .map((id) => doc.getElementById(id).textContent)
      .join(' ');
    assert.ok(name.includes('Verification'));
    assert.ok(name.includes(`${index + 1} / 6`));
    assert.equal(input.required, true);
    assert.equal(input.dataset.size, 'tiny');
    assert.equal(input.getAttribute('aria-invalid'), 'true');
    const description = input
      .getAttribute('aria-describedby')
      .split(' ')
      .map((id) => doc.getElementById(id).textContent)
      .join(' ');
    assert.equal(description, 'Enter six digits Expired');
  }
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form'))],
    [['code', '123456']],
  );
  assert.equal(inputs.filter((node) => node.tabIndex === 0).length, 1);
});
test('typing advances/replaces, completes once per changed complete value, ignores invalid characters', async () => {
  const state = controlled();
  await render(state.node);
  for (let i = 0; i < 6; i++) {
    await key(i, String(i + 1));
    assert.equal(document.activeElement, slots()[Math.min(i + 1, 5)]);
  }
  assert.equal(code(), '123456');
  assert.equal(state.value(), '123456');
  assert.deepEqual(state.completions, ['123456']);
  await key(5, '6');
  assert.equal(state.completions.length, 1);
  await key(0, '9');
  assert.equal(code(), '923456');
  assert.deepEqual(state.completions, ['123456', '923456']);
  await key(1, 'x');
  assert.equal(code(), '923456');
  assert.equal((await key(1, 'a', { metaKey: true })).defaultPrevented, false);
});
test('navigation and deletion maintain a compact string, roving Tab, Home/End and late-box entry', async () => {
  const state = controlled({ defaultValue: '1234' });
  await render(state.node);
  await key(2, 'Backspace');
  assert.equal(code(), '124');
  assert.equal(document.activeElement, slots()[1]);
  await key(1, 'Delete');
  assert.equal(code(), '14');
  assert.equal(document.activeElement, slots()[1]);
  await key(2, 'Backspace');
  assert.equal(code(), '1');
  assert.equal(document.activeElement, slots()[1]);
  await key(1, 'Home');
  assert.equal(document.activeElement, slots()[0]);
  await key(0, 'End');
  assert.equal(document.activeElement, slots()[5]);
  await key(5, '7');
  assert.equal(code(), '17');
  assert.equal(document.activeElement, slots()[2]);
  await key(2, 'ArrowLeft');
  assert.equal(document.activeElement, slots()[1]);
  await key(1, 'ArrowRight');
  assert.equal(document.activeElement, slots()[2]);
  assert.deepEqual(
    slots().map((node) => node.tabIndex),
    [-1, -1, 0, -1, -1, -1],
  );
  assert.equal((await key(2, 'Tab')).defaultPrevented, false);
});
test('full paste from any box, partial overwrite, NFKC filtering and browser autofill input events', async () => {
  const state = controlled();
  await render(state.node);
  await paste(3, ' １２３-４５６ ');
  assert.equal(code(), '123456');
  assert.equal(state.completions.length, 1);
  await paste(5, '123456');
  assert.equal(state.completions.length, 1);
  await paste(2, '98');
  assert.equal(code(), '129856');
  await type(4, '654321', { inputType: 'insertReplacementText', data: '654321' });
  assert.equal(code(), '654321');
  await type(0, '67', { inputType: 'insertText', data: '7' });
  assert.equal(code(), '754321');
  await paste(0, 'invalid');
  assert.equal(code(), '754321');
});
test('custom/global regular expressions remain stateless, alphanumeric case and dynamic configuration', async () => {
  const expression = /[0-9a-f]/gi;
  const state = controlled({ pattern: expression, length: 4 });
  await render(state.node);
  await paste(0, 'aF29');
  assert.equal(code(), 'aF29');
  await paste(0, 'Fa29');
  assert.equal(code(), 'Fa29');
  assert.equal(expression.lastIndex, 0);
  await render(h(OTPField, { length: 6, defaultValue: 'aZ23kL', pattern: 'alphanumeric' }));
  assert.equal(code(), 'aZ23kL');
  await render(h(OTPField, { length: 4, defaultValue: 'unused', pattern: 'numeric' }));
  assert.equal(code(), '23');
  await render(h(OTPField, { length: 6, defaultValue: 'unused', pattern: 'alphanumeric' }));
  assert.equal(code(), '23');
});
test('controlled external updates do not complete, and reset does not emit changes or complete', async () => {
  const state = controlled({ defaultValue: '123456' });
  await render(state.node);
  assert.deepEqual(state.completions, []);
  await act(async () => state.set('654321'));
  assert.equal(code(), '654321');
  assert.deepEqual(state.completions, []);
  await act(async () => state.set(''));
  assert.equal(code(), '');
  await paste(0, '123456');
  assert.deepEqual(state.completions, ['123456']);
});
test('mask, readonly/disabled, native cancellation and explicit aria-invalid=false', async () => {
  await render(
    h(
      Field,
      { disabled: true, invalid: false },
      h(OTPField, { length: 4, name: 'code', defaultValue: '1234', mask: true, invalid: true }),
    ),
  );
  assert.ok(slots().every((node) => node.type === 'password' && node.disabled));
  assert.ok(slots().every((node) => node.getAttribute('aria-invalid') === 'false'));
  assert.equal(host.querySelector('[type=hidden]').disabled, true);
  await key(0, '9');
  assert.equal(code(), '1234');
  await render(h(OTPField, { length: 4, defaultValue: '1234', readOnly: true }));
  await paste(0, '9876');
  await key(0, 'Backspace');
  assert.equal(code(), '1234');
  await key(0, 'ArrowRight');
  assert.equal(document.activeElement, slots()[1]);
  await render(
    h(OTPField, {
      length: 4,
      defaultValue: '1234',
      onKeyDown: (event) => event.preventDefault(),
      onPaste: (event) => event.preventDefault(),
    }),
  );
  await key(0, '9');
  await paste(0, '9876');
  assert.equal(code(), '1234');
});
test('composition defers callbacks/advance until completion; multiple characters normalize together', async () => {
  const state = controlled({ length: 4 });
  await render(state.node);
  await act(async () => {
    slots()[0].focus();
    slots()[0].dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
  });
  await type(0, '１２', { isComposing: true });
  assert.equal(state.value(), '');
  assert.equal(slots()[0].value, '１２');
  await key(0, 'ArrowRight', { isComposing: true });
  assert.equal(document.activeElement, slots()[0]);
  await act(async () =>
    slots()[0].dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true, data: '１２' }),
    ),
  );
  assert.equal(state.value(), '12');
  assert.equal(code(), '12');
  assert.equal(document.activeElement, slots()[2]);
});
test('Slot/asChild/ref cleanup and Separator anatomy are preserved without duplicate inputs', async () => {
  let seen,
    cleanups = 0;
  const focusEvents = [];
  await render(
    h(
      OTPField,
      {
        length: 2,
        name: 'code',
        ref: (node) => {
          seen = node;
          return () => cleanups++;
        },
        onFocus: () => focusEvents.push('root'),
      },
      h(
        Fragment,
        null,
        h(
          OTPField.Slot,
          { index: 0, asChild: true, onFocus: () => focusEvents.push('slot') },
          h('input', { onFocus: () => focusEvents.push('child') }),
        ),
        h(OTPField.Separator, { asChild: true }, h('span', { 'data-custom-separator': true }, '/')),
        h(OTPField.Slot, { index: 1 }),
      ),
    ),
  );
  assert.equal(seen, slots()[0]);
  assert.equal(slots().length, 2);
  assert.equal(host.querySelector('[data-custom-separator]').getAttribute('aria-hidden'), 'true');
  await act(async () => slots()[0].focus());
  assert.deepEqual(focusEvents, ['child', 'slot', 'root']);
  await act(async () => root.unmount());
  root = undefined;
  assert.ok(cleanups > 0);
});
test('native form reset, prevented reset and canonical FormData retain the whole code', async () => {
  await render(h('form', null, h(OTPField, { name: 'code', length: 4, defaultValue: '1234' })));
  await paste(0, '9876');
  assert.equal(host.querySelector('[type=hidden]').value, '9876');
  host
    .querySelector('form')
    .addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await act(async () => host.querySelector('form').reset());
  assert.equal(code(), '9876');
  await act(async () => host.querySelector('form').reset());
  assert.equal(code(), '1234');
  assert.deepEqual([...new dom.window.FormData(host.querySelector('form'))], [['code', '1234']]);
});
test('RHF + Zod value adapter: error focus, group blur, full-string submit, setValue/reset and disabled omission', async () => {
  const { Field: FormField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  const { zodResolver } = await import('@hookform/resolvers/zod');
  const { z } = await import('zod');
  const schema = z.object({ code: z.string().length(6, 'Enter six digits') });
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({ resolver: zodResolver(schema), defaultValues: { code: '' } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        {
          noValidate: true,
          onSubmit: methods.handleSubmit((value) => {
            result = value;
          }),
        },
        h(
          FormField,
          { name: 'code', controlMode: 'value', disabled },
          h(FormField.Label, null, 'Code'),
          h(OTPField, { length: 6 }),
          h(FormField.Error),
        ),
        h('button', { type: 'button' }, 'Outside'),
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
  assert.equal(document.activeElement, slots()[0]);
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Enter six digits');
  await key(0, '1');
  assert.equal(methods.getValues('code'), '1');
  assert.equal(methods.getFieldState('code').isTouched, false);
  await act(async () => host.querySelector('button').focus());
  assert.equal(methods.getFieldState('code').isTouched, true);
  await paste(3, '123456');
  await submit();
  assert.deepEqual(result, { code: '123456' });
  await act(async () => methods.setValue('code', '654321'));
  assert.equal(code(), '654321');
  await act(async () => methods.reset());
  assert.equal(code(), '');
  assert.equal(methods.getValues('code'), '');
  await act(async () => methods.setValue('code', '123456'));
  await render(h(App, { disabled: true }));
  assert.ok(slots().every((input) => input.disabled));
  await submit();
  assert.equal(result.code, undefined);
});
test('length, composition count, ordered/unique indices and asChild are validated', () => {
  for (const length of [0, 13, 2.5, NaN])
    assert.throws(() => renderToString(h(OTPField, { length })), /length/);
  for (const children of [
    [h(OTPField.Slot, { index: 0 })],
    [h(OTPField.Slot, { index: 1 }), h(OTPField.Slot, { index: 0 })],
    [h(OTPField.Slot, { index: 0 }), h(OTPField.Slot, { index: 0 })],
    [h('span', null, 'unknown')],
  ])
    assert.throws(() => renderToString(h(OTPField, { length: 2 }, ...children)), /OTPField/);
  assert.throws(
    () =>
      renderToString(
        h(OTPField, { length: 1 }, h(OTPField.Slot, { index: 0, asChild: true }, h('textarea'))),
      ),
    /input/,
  );
});
