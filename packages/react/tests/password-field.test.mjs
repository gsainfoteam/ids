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
  'KeyboardEvent',
  'FocusEvent',
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
  assert.equal(doc.querySelector('[data-password-field]').dataset.size, 'tiny');
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
  assert.equal(toggle().getAttribute('aria-label'), '비밀번호 표시', 'a toggle keeps one name');
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
  assert.deepEqual(events, ['child', 'root', 'sentinel']);
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
test('Input values win over root values, but root and Input handlers both run', async () => {
  const changes = [];
  await render(
    h(
      PasswordField,
      { id: 'root-id', name: 'root', onChange: () => changes.push('root') },
      h(PasswordField.Input, { name: 'new-password', onChange: () => changes.push('input') }),
    ),
  );
  assert.equal(input().id, 'root-id');
  assert.equal(input().name, 'new-password');
  assert.equal(input().autocomplete, 'new-password');
  assert.equal(toggle().getAttribute('aria-controls'), 'root-id');
  await type('a');
  assert.deepEqual(changes, ['root', 'input']);
});
test('children without an Input become leading adornments before an inserted Input', async () => {
  await render(h(PasswordField, { name: 'password' }, h('span', null, 'Lock')));
  assert.deepEqual(
    Array.from(host.querySelector('[data-password-field]').children, (el) =>
      'passwordFieldAdornment' in el.dataset
        ? el.textContent
        : el.getAttribute('role') === 'status'
          ? 'CAPS'
          : el.tagName,
    ),
    ['Lock', 'INPUT', 'CAPS', 'BUTTON'],
  );
  assert.equal(input().type, 'password');
});
test('sentinel inside a Fragment splits leading and trailing; the toggle stays unwrapped', async () => {
  await render(
    h(
      PasswordField,
      { name: 'password' },
      h(
        Fragment,
        null,
        h('span', null, 'Lead'),
        h(PasswordField.Input),
        h(PasswordField.VisibilityToggle),
        h('span', null, 'Trail'),
      ),
    ),
  );
  assert.deepEqual(
    Array.from(host.querySelector('[data-password-field]').children, (el) =>
      'passwordFieldAdornment' in el.dataset
        ? el.textContent
        : el.getAttribute('role') === 'status'
          ? 'CAPS'
          : el.tagName,
    ),
    ['Lead', 'INPUT', 'BUTTON', 'Trail', 'CAPS'],
  );
  await click();
  assert.equal(input().type, 'text');
});
test('asChild merges root and Input props and ref into the child input, keeping the internal type', async () => {
  let node;
  const changes = [];
  await render(
    h(
      PasswordField,
      {
        name: 'password',
        onChange: () => changes.push('root'),
        ref: (value) => {
          node = value;
        },
      },
      h(
        PasswordField.Input,
        { asChild: true, placeholder: 'input' },
        h('input', { type: 'email', placeholder: 'child', onChange: () => changes.push('child') }),
      ),
    ),
  );
  assert.equal(node, input());
  assert.equal(input().name, 'password');
  assert.equal(input().placeholder, 'input');
  assert.equal(input().type, 'password');
  assert.ok('passwordFieldInput' in input().dataset);
  await type('a');
  assert.deepEqual(changes, ['child', 'root']);
});
test('invalid structures fail clearly', () => {
  for (const children of [
    [h(PasswordField.Input), h(PasswordField.Input)],
    [h(PasswordField.Input), h(PasswordField.VisibilityToggle), h(PasswordField.VisibilityToggle)],
    [h(PasswordField.Input, { asChild: true }, h('textarea'))],
    [h(PasswordField.Input, null, 'text')],
  ])
    assert.throws(
      () => renderToString(h(PasswordField, { name: 'password' }, ...children)),
      /\[IDS\] `<PasswordField/,
    );
  assert.throws(
    () => renderToString(h(PasswordField.Input)),
    /\[IDS\] `<PasswordField.Input>` must be used inside `<PasswordField>`/,
  );
});

const shell = () => host.querySelector('[data-password-field]');
const caps = () => host.querySelector('[data-password-field-caps-lock]');
const status = () => host.querySelector('[data-password-field] [role=status]');
async function key(type, init = {}) {
  await act(async () =>
    input().dispatchEvent(new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init })),
  );
}

test('the Caps Lock indicator follows the modifier state while the input has focus', async () => {
  await render(h(PasswordField, { name: 'password' }));
  assert.equal(caps(), null);
  assert.equal(
    status().textContent,
    '',
    'the live region is mounted before it has anything to say',
  );
  await act(async () => input().focus());
  await key('keydown', { key: 'a', modifierCapsLock: true });
  assert.ok(caps());
  assert.equal(caps().getAttribute('aria-hidden'), 'true');
  assert.equal(status().textContent, 'Caps Lock이 켜져 있습니다.');
  await key('keyup', { key: 'CapsLock', modifierCapsLock: false });
  assert.equal(caps(), null);
  assert.equal(status().textContent, '');
  await key('keydown', { key: 'a', modifierCapsLock: true });
  await act(async () => input().blur());
  assert.equal(caps(), null, 'leaving the field hides it');
  await render(h(PasswordField, { key: 'hidden', name: 'password', hideCapsLock: true }));
  assert.equal(status(), null);
  await render(
    h(
      PasswordField,
      { key: 'explicit', name: 'password' },
      h(PasswordField.CapsLock, { label: 'Caps on' }),
      h(PasswordField.Input),
    ),
  );
  await act(async () => input().focus());
  await key('keydown', { key: 'a', modifierCapsLock: true });
  assert.equal(caps().getAttribute('title'), 'Caps on');
  assert.equal(shell().children[0], caps(), 'an explicit part keeps its place');
});

test('visibility can be controlled, and a submit masks the password again', async () => {
  const changes = [];
  function Controlled() {
    const [visible, setVisible] = useState(true);
    return h(PasswordField, {
      name: 'password',
      visible,
      onVisibleChange: (next) => {
        changes.push(next);
        setVisible(next);
      },
    });
  }
  await render(h(Controlled));
  assert.equal(input().type, 'text');
  assert.ok(shell().hasAttribute('data-visible'));
  await click();
  assert.deepEqual(changes, [false]);
  assert.equal(input().type, 'password');
  let submittedType;
  await render(
    h(
      'form',
      {
        key: 'form',
        onSubmit: (event) => {
          event.preventDefault();
          submittedType = input().type;
        },
      },
      h(PasswordField, { name: 'password', defaultVisible: true }),
    ),
  );
  assert.equal(input().type, 'text');
  await act(async () =>
    host
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );
  assert.equal(submittedType, 'password', 'the input is a password field when the form is sent');
  assert.equal(input().type, 'password');
});

test('onValueChange, the shell state and a Clear part with Escape', async () => {
  const values = [];
  await render(
    h(
      PasswordField,
      { name: 'password', invalid: true, onValueChange: (value) => values.push(value) },
      h(PasswordField.Input),
      h(PasswordField.Clear),
    ),
  );
  assert.ok(shell().hasAttribute('data-invalid'));
  assert.ok(input().hasAttribute('data-field-input'));
  await type('secret');
  assert.ok(shell().hasAttribute('data-filled'));
  const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  await act(async () => input().dispatchEvent(escape));
  assert.equal(escape.defaultPrevented, true);
  assert.equal(input().value, '');
  assert.deepEqual(values, ['secret', '']);
});

test('typing hints default off, and the toggle icon can follow the state', async () => {
  await render(
    h(
      PasswordField,
      { name: 'password' },
      h(PasswordField.Input),
      h(PasswordField.VisibilityToggle, null, (state) =>
        h('svg', { 'data-icon': state.visible ? 'open' : 'closed' }),
      ),
    ),
  );
  assert.equal(input().getAttribute('spellcheck'), 'false');
  assert.equal(input().getAttribute('autocapitalize'), 'none');
  assert.equal(input().getAttribute('autocorrect'), 'off');
  assert.equal(host.querySelector('[data-icon]').dataset.icon, 'closed');
  await click();
  assert.equal(host.querySelector('[data-icon]').dataset.icon, 'open');
});
