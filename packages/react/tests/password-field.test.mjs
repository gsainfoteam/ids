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
  'MouseEvent',
  'CompositionEvent',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState, Fragment } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Field, PasswordField } = await import('../dist/index.js');
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
const input = () => host.querySelector('input');
const toggle = () => host.querySelector('button');
async function type(value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input(), value);
    input().dispatchEvent(new InputEvent('input', { bubbles: true }));
  });
}
async function click(pointer = true) {
  await act(async () =>
    toggle().dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, detail: pointer ? 1 : 0 }),
    ),
  );
}

test('SSR native password, inferred/explicit autocomplete, Field label/ARIA and successful FormData', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { required: true, invalid: true, size: 'tiny' },
          h(Field.Label, null, 'Password'),
          h(PasswordField, { name: 'account.newPassword', defaultValue: 'sample secret' }),
          h(Field.Error, null, 'Check password'),
        ),
      ),
    ),
  ).window.document;
  const node = doc.querySelector('input');
  assert.equal(node.type, 'password');
  assert.equal(node.autocomplete, 'new-password');
  assert.equal(node.dataset.size, 'tiny');
  assert.equal(node.required, true);
  assert.equal(doc.querySelector('label').htmlFor, node.id);
  assert.equal(node.getAttribute('aria-invalid'), 'true');
  assert.equal(
    doc.getElementById(node.getAttribute('aria-describedby')).textContent,
    'Check password',
  );
  assert.equal(doc.querySelector('button').getAttribute('aria-pressed'), 'false');
  assert.equal(doc.querySelector('button').getAttribute('aria-controls'), node.id);
  assert.equal(doc.querySelector('button').type, 'button');
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form'))],
    [['account.newPassword', 'sample secret']],
  );
  for (const [props, expected] of [
    [{ name: 'password' }, 'current-password'],
    [{ name: 'new-password' }, 'new-password'],
    [{ name: 'new-password', autoComplete: 'off' }, 'off'],
    [{ name: 'confirmation', autoComplete: 'new-password' }, 'new-password'],
  ]) {
    const markup = new JSDOM(renderToString(h(PasswordField, props))).window.document;
    assert.equal(markup.querySelector('input').autocomplete, expected);
  }
});
test('pointer visibility preserves DOM/value/selection/focus without onChange or submit; keyboard keeps button focus', async () => {
  let changes = 0,
    submits = 0;
  await render(
    h(
      'form',
      {
        onSubmit: (e) => {
          e.preventDefault();
          submits++;
        },
      },
      h(PasswordField, { name: 'password', defaultValue: 'abcDEF123', onChange: () => changes++ }),
    ),
  );
  const original = input();
  await act(async () => {
    input().focus();
    input().setSelectionRange(2, 6, 'backward');
  });
  await click();
  assert.equal(input(), original);
  assert.equal(input().type, 'text');
  assert.equal(input().value, 'abcDEF123');
  assert.equal(document.activeElement, input());
  assert.deepEqual(
    [input().selectionStart, input().selectionEnd, input().selectionDirection],
    [2, 6, 'backward'],
  );
  assert.equal(toggle().getAttribute('aria-label'), '비밀번호 숨기기');
  assert.equal(toggle().getAttribute('aria-pressed'), 'true');
  await act(async () => toggle().focus());
  await click(false);
  assert.equal(input().type, 'password');
  assert.equal(document.activeElement, toggle());
  assert.equal(changes, 0);
  assert.equal(submits, 0);
});
test('controlled input forwards native changes, external values, composition and readonly visibility', async () => {
  let setValue;
  const events = [];
  function App() {
    const [value, set] = useState('');
    setValue = set;
    return h(PasswordField, {
      name: 'password',
      value,
      onChange: (e) => {
        events.push(e.target.value);
        set(e.target.value);
      },
      onCompositionStart: () => events.push('start'),
      onCompositionEnd: () => events.push('end'),
    });
  }
  await render(h(App));
  await type('日本語 abc');
  await click();
  assert.equal(input().value, '日本語 abc');
  await act(async () => setValue('external'));
  assert.equal(input().value, 'external');
  await act(async () => {
    input().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    input().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
  });
  assert.deepEqual(events, ['日本語 abc', 'start', 'end']);
  await render(h(PasswordField, { name: 'password', readOnly: true, defaultValue: 'read-only' }));
  assert.equal(input().readOnly, true);
  assert.equal(toggle().disabled, false);
  await click();
  assert.equal(input().type, 'text');
});
test('disabled/invalid overrides and hidden auto toggle while explicit composition remains available', async () => {
  await render(
    h(
      Field,
      { disabled: true, invalid: false },
      h(PasswordField, { name: 'password', invalid: true, defaultValue: 'secret' }),
    ),
  );
  assert.equal(input().disabled, true);
  assert.equal(toggle().disabled, true);
  assert.equal(input().getAttribute('aria-invalid'), 'false');
  await click();
  assert.equal(input().type, 'password');
  await render(h(PasswordField, { name: 'password', hideVisibilityToggle: true }));
  assert.equal(toggle(), null);
  await render(
    h(
      PasswordField,
      { name: 'password', hideVisibilityToggle: true },
      h(Fragment, null, h(PasswordField.Input), h(PasswordField.VisibilityToggle)),
    ),
  );
  assert.equal(host.querySelectorAll('button').length, 1);
});
test('sentinel/asChild event/ref composition, explicit toggle and preventDefault override', async () => {
  const events = [];
  let seen;
  let cleanups = 0;
  await render(
    h(
      PasswordField,
      {
        name: 'password',
        ref: (node) => {
          seen = node;
          return () => cleanups++;
        },
        onFocus: () => events.push('root'),
      },
      h('span', null, 'Lock'),
      h(
        PasswordField.Input,
        { asChild: true, onFocus: () => events.push('sentinel') },
        h('input', { onFocus: () => events.push('child'), autoComplete: 'new-password' }),
      ),
      h(PasswordField.VisibilityToggle, { asChild: true }, h('button', null, 'Show')),
    ),
  );
  assert.equal(seen, input());
  assert.equal(input().autocomplete, 'new-password');
  assert.equal(host.querySelectorAll('button').length, 1);
  await act(async () => input().focus());
  assert.deepEqual(events, ['child', 'sentinel', 'root']);
  await click();
  assert.equal(input().type, 'text');
  await act(async () => root.unmount());
  root = undefined;
  assert.ok(cleanups > 0);
  await render(
    h(
      PasswordField,
      { name: 'password' },
      h(PasswordField.Input),
      h(PasswordField.VisibilityToggle, { onClick: (e) => e.preventDefault() }),
    ),
  );
  await click();
  assert.equal(input().type, 'password');
});
test('native reset restores uncontrolled value and masks it; canceled reset preserves both', async () => {
  await render(h('form', null, h(PasswordField, { name: 'password', defaultValue: 'initial' })));
  await type('edited');
  await click();
  host.querySelector('form').addEventListener('reset', (e) => e.preventDefault(), { once: true });
  await act(async () => host.querySelector('form').reset());
  assert.equal(input().value, 'edited');
  assert.equal(input().type, 'text');
  await act(async () => host.querySelector('form').reset());
  assert.equal(input().value, 'initial');
  assert.equal(input().type, 'password');
});
test('RHF native + Zod matching: error focus, input retained on toggle, submit, reset and disabled omission', async () => {
  const { Field: FormField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  const { zodResolver } = await import('@hookform/resolvers/zod');
  const { z } = await import('zod');
  const schema = z
    .object({ password: z.string().min(8, 'Too short'), confirmation: z.string() })
    .refine((v) => v.password === v.confirmation, { path: ['confirmation'], message: 'Mismatch' });
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({
      resolver: zodResolver(schema),
      defaultValues: { password: '', confirmation: '' },
    });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        {
          noValidate: true,
          onSubmit: methods.handleSubmit((v) => {
            result = v;
          }),
        },
        ...['password', 'confirmation'].map((name) =>
          h(
            FormField,
            { key: name, name, disabled },
            h(FormField.Label, null, name),
            h(PasswordField, { autoComplete: 'new-password' }),
            h(FormField.Error),
          ),
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
  assert.equal(document.activeElement, input());
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Too short');
  await type('test-secret');
  await click();
  assert.equal(methods.getValues('password'), 'test-secret');
  await act(async () => methods.setValue('confirmation', 'different'));
  await submit();
  assert.equal(result, undefined);
  assert.equal(document.activeElement.name, 'confirmation');
  await act(async () => methods.setValue('confirmation', 'test-secret'));
  await submit();
  assert.deepEqual(result, { password: 'test-secret', confirmation: 'test-secret' });
  await act(async () => methods.reset());
  assert.equal(input().value, '');
  assert.equal(host.querySelectorAll('input')[1].value, '');
  await act(async () => methods.reset({ password: 'test-secret', confirmation: 'test-secret' }));
  await render(h(App, { disabled: true }));
  assert.equal(input().disabled, true);
  assert.equal(toggle().disabled, true);
  await submit();
  assert.equal(result.password, undefined);
});
test('ambiguous composition fails clearly', () => {
  for (const children of [
    [h(PasswordField.Input), h(PasswordField.Input)],
    [h('span', null, 'missing')],
    [h(PasswordField.Input), h(PasswordField.VisibilityToggle), h(PasswordField.VisibilityToggle)],
    [h(PasswordField.Input, { asChild: true }, h('textarea'))],
  ])
    assert.throws(
      () => renderToString(h(PasswordField, { name: 'password' }, ...children)),
      /PasswordField/,
    );
});
