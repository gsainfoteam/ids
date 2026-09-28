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
  'FocusEvent',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
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

const field = () => host.querySelector('[data-otp-field] input');
const slots = () => [...host.querySelectorAll('[data-otp-slot]')];
const shown = () =>
  slots()
    .map((slot) => slot.textContent)
    .join('');

async function type(value, data = null) {
  await act(async () => {
    const input = field();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new InputEvent('input', { bubbles: true, data, inputType: 'insertText' }));
  });
}
async function paste(text, start, end = start) {
  let event;
  await act(async () => {
    const input = field();
    input.focus();
    if (start !== undefined) input.setSelectionRange(start, end);
    event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    input.dispatchEvent(event);
  });
  return event;
}

function tracked(props = {}) {
  const changes = [];
  const completions = [];
  return {
    changes,
    completions,
    node: h(OTPField, {
      length: 6,
      'aria-label': 'Code',
      ...props,
      onValueChange: (next) => changes.push(next),
      onComplete: (next) => completions.push(next),
    }),
  };
}

const resetSettles = () => new Promise((resolve) => setTimeout(resolve));

test('SSR: one real input carries the name, label, description, validation and autofill hints', () => {
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
  const inputs = doc.querySelectorAll('input');
  assert.equal(inputs.length, 1);
  const [input] = inputs;
  assert.equal(doc.querySelector('label').htmlFor, input.id);
  assert.equal(input.autocomplete, 'one-time-code');
  assert.equal(input.inputMode, 'numeric');
  assert.equal(input.maxLength, 6);
  assert.equal(input.getAttribute('pattern'), '.{6}');
  assert.equal(input.required, true);
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  assert.equal(input.hasAttribute('aria-label'), false);
  const description = input
    .getAttribute('aria-describedby')
    .split(' ')
    .map((id) => doc.getElementById(id).textContent)
    .join(' ');
  assert.equal(description, 'Enter six digits Expired');
  const visual = [...doc.querySelectorAll('[data-otp-slot]')];
  assert.equal(visual.length, 6);
  assert.ok(visual.every((slot) => slot.getAttribute('aria-hidden') === 'true'));
  assert.equal(doc.querySelector('[data-otp-field]').dataset.size, 'tiny');
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form'))],
    [['code', '123456']],
  );
});

test('an unlabelled field gets a default accessible name; the HTML pattern only checks length', () => {
  const html = (props) =>
    new JSDOM(renderToString(h(OTPField, { length: 4, ...props }))).window.document.querySelector(
      'input',
    );
  assert.equal(html({}).getAttribute('aria-label'), '인증 코드');
  assert.equal(html({ id: 'x' }).hasAttribute('aria-label'), false);
  assert.equal(html({ pattern: 'alphanumeric' }).inputMode, 'text');
  assert.equal(html({ pattern: /[a-c]/i }).getAttribute('pattern'), '.{4}');
});

test('typed input is cleaned, complete fires once per transition to full', async () => {
  const state = tracked();
  await render(state.node);
  await type('12a3', 'a');
  assert.equal(field().value, '123');
  assert.equal(shown(), '123');
  await type('123456', '6');
  assert.deepEqual(state.completions, ['123456']);
  await type('123457', '7');
  assert.deepEqual(state.completions, ['123456'], 'editing a full code does not complete again');
  await type('12345', null);
  await type('123458', '8');
  assert.deepEqual(state.completions, ['123456', '123458']);
  assert.deepEqual(state.changes, ['123', '123456', '123457', '12345', '123458']);
});

test('full-width digits are folded, and an autofilled full code wins over what was typed', async () => {
  const state = tracked();
  await render(state.node);
  await type('１２', '２');
  assert.equal(field().value, '12');
  await type('12987654', '987654');
  assert.equal(field().value, '987654');
});

test('beforeinput rejects a disallowed character before it reaches the DOM', async () => {
  await render(tracked().node);
  const event = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    data: 'x',
    inputType: 'insertText',
  });
  field().dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  const ok = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    data: '7',
    inputType: 'insertText',
  });
  field().dispatchEvent(ok);
  assert.equal(ok.defaultPrevented, false);
});

test('paste: a full code replaces from anywhere, a partial one overwrites from the selection', async () => {
  const state = tracked({ defaultValue: '1234' });
  await render(state.node);
  const event = await paste('98-76-54', 1, 2);
  assert.equal(event.defaultPrevented, true);
  assert.equal(field().value, '987654');
  await paste('11', 2, 3);
  assert.equal(field().value, '981154');
  await paste('--');
  assert.equal(field().value, '981154', 'nothing acceptable in the clipboard changes nothing');
  await render(h('div', { key: 'readonly' }, tracked({ defaultValue: '12', readOnly: true }).node));
  await paste('999999', 0);
  assert.equal(field().value, '12');
});

test('a collapsed caret over a character selects it, and that slot shows as active', async () => {
  await render(tracked({ defaultValue: '1234' }).node);
  await act(async () => {
    field().focus();
  });
  assert.deepEqual(
    [field().selectionStart, field().selectionEnd],
    [4, 4],
    'focus goes to the next empty slot',
  );
  assert.ok(slots()[4].hasAttribute('data-active'));
  assert.ok(slots()[4].querySelector('[class*=caret]'), 'an empty active slot draws the caret');
  await act(async () => {
    field().setSelectionRange(1, 1);
    document.dispatchEvent(new Event('selectionchange'));
  });
  assert.deepEqual([field().selectionStart, field().selectionEnd], [1, 2]);
  assert.deepEqual(
    slots().map((slot) => slot.hasAttribute('data-active')),
    [false, true, false, false, false, false],
  );
  await act(async () => {
    field().setSelectionRange(0, 4);
    document.dispatchEvent(new Event('selectionchange'));
  });
  assert.deepEqual(
    slots().map((slot) => slot.hasAttribute('data-active')),
    [true, true, true, true, false, false],
    'a range selection highlights every selected slot',
  );
  await act(async () => field().blur());
  assert.ok(slots().every((slot) => !slot.hasAttribute('data-active')));
});

test('focusing a full code selects the last character so typing replaces it', async () => {
  await render(tracked({ defaultValue: '123456' }).node);
  await act(async () => field().focus());
  assert.deepEqual([field().selectionStart, field().selectionEnd], [5, 6]);
});

test('controlled: the parent value is the source of truth', async () => {
  let set;
  const changes = [];
  function App() {
    const [value, setValue] = useState('12');
    set = setValue;
    return h(OTPField, {
      length: 6,
      value,
      'aria-label': 'Code',
      onValueChange: (next) => {
        changes.push(next);
        setValue(next);
      },
    });
  }
  await render(h(App));
  assert.equal(field().value, '12');
  await act(async () => set('3x4'));
  assert.equal(field().value, '34', 'a controlled value is cleaned too');
  assert.deepEqual(changes, [], 'a parent update is not echoed back as a change');
  await type('345', '5');
  assert.deepEqual(changes, ['345']);
});

test('a direct write to input.value (react-hook-form reset/setValue) reaches state', async () => {
  const state = tracked({ defaultValue: '123' });
  await render(state.node);
  await act(async () => {
    field().value = '9x87';
    await Promise.resolve();
  });
  assert.equal(field().value, '987');
  assert.equal(shown(), '987');
  assert.deepEqual(state.changes, ['987']);
});

test('composition shows the draft and commits the cleaned value when it ends', async () => {
  const state = tracked({ pattern: 'alphanumeric' });
  await render(state.node);
  await act(async () => {
    field().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
  });
  await type('abㄱ');
  assert.equal(field().value, 'abㄱ');
  assert.deepEqual(state.changes, []);
  await act(async () => {
    field().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
  });
  assert.equal(field().value, 'ab');
  assert.deepEqual(state.changes, ['ab']);
});

test('native form reset restores the default, FormData holds one entry', async () => {
  await render(
    h(
      'form',
      null,
      h(OTPField, { length: 4, name: 'pin', defaultValue: '12', 'aria-label': 'PIN' }),
    ),
  );
  const form = host.querySelector('form');
  await type('1234', '4');
  assert.deepEqual([...new window.FormData(form)], [['pin', '1234']]);
  await act(async () => {
    form.reset();
    await resetSettles();
    await Promise.resolve();
  });
  assert.equal(field().value, '12');
  assert.deepEqual([...new window.FormData(form)], [['pin', '12']]);
});

test('mask and placeholder only change what the slots draw', async () => {
  await render(tracked({ length: 4, defaultValue: '12', mask: true, placeholder: 'abcd' }).node);
  assert.equal(field().value, '12');
  assert.equal(shown(), 'cd', 'the default mask is a drawn dot, not a character');
  assert.equal(host.querySelectorAll('[data-otp-slot] span.rounded-full').length, 2);
  await render(
    h('div', { key: 'star' }, tracked({ length: 4, defaultValue: '12', mask: '*' }).node),
  );
  assert.equal(shown(), '**');
});

test('custom layout: groups, separators and slot render functions', async () => {
  await render(
    h(
      OTPField,
      { length: 4, defaultValue: '1', 'aria-label': 'Code' },
      h(OTPField.Group, null, h(OTPField.Slot, { index: 0 }), h(OTPField.Slot, { index: 1 })),
      h(OTPField.Separator),
      h(OTPField.Slot, { index: 2, className: (s) => (s.isFilled ? 'filled' : 'empty') }),
      h(OTPField.Slot, { index: 3 }, (s) => `#${s.index}`),
    ),
  );
  assert.equal(host.querySelectorAll('input').length, 1);
  assert.ok(slots()[0].hasAttribute('data-grouped'));
  assert.ok(!slots()[2].hasAttribute('data-grouped'));
  assert.ok(slots()[2].className.includes('empty'));
  assert.equal(slots()[3].textContent, '#3');
  assert.equal(host.querySelector('[aria-hidden=true] svg') !== null, true);
});

test('react-hook-form register(): submit, error, and reset through the DOM value', async () => {
  const { Field: FormField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  const { zodResolver } = await import('@hookform/resolvers/zod');
  const { z } = await import('zod');
  const schema = z.object({ code: z.string().length(6, 'Enter six digits') });
  let methods, result;
  function App() {
    methods = useForm({ resolver: zodResolver(schema), defaultValues: { code: '' } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { noValidate: true, onSubmit: methods.handleSubmit((value) => (result = value)) },
        h(
          FormField,
          { name: 'code' },
          h(FormField.Label, null, 'Code'),
          h(OTPField, { length: 6 }),
          h(FormField.Error),
        ),
      ),
    );
  }
  await render(h(App));
  const submit = () =>
    act(async () => {
      host
        .querySelector('form')
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  await submit();
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Enter six digits');
  await type('12-3456', '6');
  assert.equal(methods.getValues('code'), '123456');
  await submit();
  assert.deepEqual(result, { code: '123456' });
  await act(async () => {
    methods.reset({ code: '654321' });
    await Promise.resolve();
  });
  assert.equal(field().value, '654321');
  assert.equal(shown(), '654321');
});

test('length is validated', () => {
  assert.throws(() => renderToString(h(OTPField, { length: 0 })), /length/);
  assert.throws(() => renderToString(h(OTPField, { length: 13 })), /length/);
  assert.throws(
    () => renderToString(h(OTPField, { length: 2 }, h(OTPField.Slot, { index: 2 }))),
    /outside the code length/,
  );
});

test('react-hook-form controlMode="value": the native change event carries the cleaned code', async () => {
  const { Field: FormField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods;
  function App() {
    methods = useForm({ defaultValues: { code: '12' } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        null,
        h(
          FormField,
          { name: 'code', controlMode: 'value' },
          h(FormField.Label, null, 'Code'),
          h(OTPField, { length: 6 }),
        ),
      ),
    );
  }
  await render(h(App));
  assert.equal(field().value, '12');
  await type('12a3', 'a');
  assert.equal(methods.getValues('code'), '123');
  await act(async () => methods.setValue('code', '999999'));
  assert.equal(shown(), '999999');
});
