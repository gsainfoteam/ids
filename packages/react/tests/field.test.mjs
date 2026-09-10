import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const name of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Event', 'MouseEvent'])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState, Fragment } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Field, TextField } = await import('../dist/index.js');
const { Field: RhfField } = await import('../dist/react-hook-form.js');
const { useForm, FormProvider } = await import('react-hook-form');
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
async function input(node, value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const part = (name) => host.querySelector(`[data-field-part="${name}"]`);
const control = () => host.querySelector('input');

// Verify the published bundle, not a source alias.
test('SSR wires generated IDs immediately, without effects', () => {
  const markup = renderToString(
    h(
      Field,
      { required: true },
      h(Field.Label, null, 'Email'),
      h(TextField),
      h(Field.Description, null, 'Description'),
    ),
  );
  const doc = new JSDOM(markup).window.document;
  const node = doc.querySelector('input');
  assert.equal(doc.querySelector('label').htmlFor, node.id);
  assert.equal(node.getAttribute('aria-labelledby'), doc.querySelector('label').id);
  assert.equal(
    node.getAttribute('aria-describedby'),
    doc.querySelector('[data-field-part=description]').id,
  );
});
test('label association, explicit IDs, describedby merge and dynamic error/hint swap', async () => {
  const view = (invalid) =>
    h(
      Field,
      { invalid, required: true },
      h(
        Fragment,
        null,
        h(Field.Label, { id: 'custom-label' }, 'Email'),
        h(Field.Description, null, 'Private'),
        h(TextField, { id: 'custom-input', 'aria-describedby': 'external external' }),
        h(Field.Hint, null, 'Hint'),
        h(Field.Error, null, 'Invalid'),
      ),
    );
  await render(view(false));
  assert.equal(part('label').htmlFor, 'custom-input');
  assert.equal(part('label').control === control(), true);
  assert.equal(control().getAttribute('aria-labelledby'), 'custom-label');
  assert.equal(
    control().getAttribute('aria-describedby'),
    'external custom-input-description custom-input-hint',
  );
  assert.equal(control().getAttribute('aria-required'), 'true');
  await render(view(true));
  assert.equal(part('hint'), null);
  assert.equal(part('error').textContent, 'Invalid');
  assert.equal(
    control().getAttribute('aria-describedby'),
    'external custom-input-description custom-input-error',
  );
  assert.equal(control().getAttribute('aria-invalid'), 'true');
  await render(h(Field, { 'aria-label': 'No description' }, h(TextField)));
  assert.equal(control().getAttribute('aria-describedby'), null);
});
test('asChild uses real custom label IDs and retains its handler and required marker', async () => {
  let clicks = 0;
  await render(
    h(
      Field,
      { required: true },
      h(
        Field.Label,
        { asChild: true },
        h('label', { id: 'nested-label', onClick: () => clicks++ }, 'Name'),
      ),
      h(TextField),
    ),
  );
  assert.equal(control().getAttribute('aria-labelledby'), 'nested-label');
  await act(async () => part('label').click());
  assert.equal(clicks, 1);
  assert.equal(part('label').control === control(), true);
  assert.equal(part('label').querySelector('[aria-hidden]').textContent, '*');
});
test('size inheritance, explicit child size, disabled and explicit state override', async () => {
  await render(h(Field, { size: 'tiny', disabled: true, 'aria-label': 'Name' }, h(TextField)));
  assert.equal(control().dataset.size, 'tiny');
  assert.equal(control().disabled, true);
  await render(
    h(
      Field,
      { size: 'tiny', disabled: false, invalid: false, 'aria-label': 'Name' },
      h(TextField, { size: 'standard', disabled: true, 'aria-invalid': true }),
    ),
  );
  assert.equal(control().dataset.size, 'standard');
  assert.equal(control().disabled, false);
  assert.equal(control().getAttribute('aria-invalid'), 'false');
});

function rhfHarness({
  mode = 'native',
  options,
  fieldProps,
  child,
  defaultValues = { profile: { email: '' } },
  formDisabled = false,
} = {}) {
  let methods;
  function App() {
    methods = useForm({ defaultValues, mode: 'onChange', disabled: formDisabled });
    return h(
      FormProvider,
      methods,
      h(
        RhfField,
        { name: 'profile.email', controlMode: mode, registerOptions: options, ...fieldProps },
        h(RhfField.Label, null, 'Email'),
        child ?? h(TextField),
        h(RhfField.Hint, null, 'Hint'),
        h(RhfField.Error),
      ),
    );
  }
  return { node: h(App), methods: () => methods };
}
test('RHF native nested registration, handlers/ref, error focus and reset', async () => {
  let changes = 0;
  let refNode;
  let cleanup = 0;
  const form = rhfHarness({
    options: { required: 'Enter email' },
    child: h(TextField, {
      onChange: () => changes++,
      ref: (node) => {
        refNode = node;
        return () => cleanup++;
      },
    }),
  });
  await render(form.node);
  assert.equal(refNode === control(), true);
  await act(async () => {
    await form.methods().trigger('profile.email', { shouldFocus: true });
  });
  assert.equal(part('error').textContent, 'Enter email');
  assert.equal(part('hint'), null);
  assert.equal(document.activeElement === control(), true);
  await input(control(), 'user@example.com');
  assert.equal(form.methods().getValues('profile.email'), 'user@example.com');
  assert.equal(changes, 1);
  assert.equal(part('error'), null);
  assert.ok(part('hint'));
  await act(async () => form.methods().reset({ profile: { email: 'reset@example.com' } }));
  assert.equal(control().value, 'reset@example.com');
  await act(async () => root.unmount());
  root = undefined;
  assert.ok(cleanup > 0);
});
test('RHF explicit invalid=false overrides an error and disabled form propagates', async () => {
  const form = rhfHarness({ fieldProps: { invalid: false, disabled: false }, formDisabled: true });
  await render(form.node);
  await act(async () => form.methods().setError('profile.email', { message: 'Server error' }));
  assert.equal(control().getAttribute('aria-invalid'), 'false');
  assert.equal(part('error'), null);
  assert.equal(control().disabled, true);
});
test('RHF native setValueAs and checkbox registration preserve native semantics', async () => {
  const form = rhfHarness({ options: { setValueAs: (value) => value.toUpperCase() } });
  await render(form.node);
  await input(control(), 'abc');
  assert.equal(form.methods().getValues('profile.email'), 'ABC');
  await act(async () => root.unmount());
  root = undefined;
  const check = rhfHarness({
    child: h('input', { type: 'checkbox' }),
    defaultValues: { profile: { email: false } },
  });
  await render(check.node);
  await act(async () => control().click());
  assert.equal(check.methods().getValues('profile.email'), true);
});
test('RHF controlled value callback supports reset and external setValue', async () => {
  function ValueInput({ value, onChange, ...rest }) {
    return h('input', { ...rest, value, onChange: (event) => onChange(event.target.value) });
  }
  const form = rhfHarness({
    mode: 'value',
    child: h(ValueInput),
    defaultValues: { profile: { email: 'initial' } },
  });
  await render(form.node);
  assert.equal(control().value, 'initial');
  await input(control(), 'typed');
  assert.equal(form.methods().getValues('profile.email'), 'typed');
  await act(async () => form.methods().setValue('profile.email', 'external'));
  assert.equal(control().value, 'external');
  await act(async () => form.methods().reset());
  assert.equal(control().value, 'initial');
});
test('RHF controlled checked callback binds booleans, disabled values omitted on submit', async () => {
  function CheckedInput({ checked, onChange, ...rest }) {
    return h('input', {
      ...rest,
      type: 'checkbox',
      checked,
      onChange: (event) => onChange(event.target.checked),
    });
  }
  const form = rhfHarness({
    mode: 'checked',
    child: h(CheckedInput),
    defaultValues: { profile: { email: false } },
  });
  await render(form.node);
  await act(async () => control().click());
  assert.equal(form.methods().getValues('profile.email'), true);
  await act(async () => form.methods().reset());
  assert.equal(control().checked, false);
  await act(async () => root.unmount());
  root = undefined;
  const disabled = rhfHarness({
    fieldProps: { disabled: true },
    defaultValues: { profile: { email: 'omit' } },
  });
  await render(disabled.node);
  let submitted;
  await act(async () =>
    disabled.methods().handleSubmit((values) => {
      submitted = values;
    })(),
  );
  assert.equal(submitted.profile?.email, undefined);
});
test('optional adapter works without provider and with changing name/context', async () => {
  await render(h(RhfField, { 'aria-label': 'Plain' }, h(TextField)));
  await input(control(), 'plain');
  assert.equal(control().value, 'plain');
  function App() {
    const methods = useForm({ defaultValues: { first: 'one', second: 'two' } });
    const [name, setName] = useState('first');
    return h(
      FormProvider,
      methods,
      h('button', { onClick: () => setName('second') }, 'Switch'),
      h(RhfField, { name, 'aria-label': 'Dynamic' }, h(TextField)),
    );
  }
  await render(h(App));
  assert.equal(control().value, 'one');
  await act(async () => host.querySelector('button').click());
  assert.equal(control().value, 'two');
});

test('Zod resolver: nested native + controlled cross-field errors, parsed output, reset', async () => {
  const { zodResolver } = await import('@hookform/resolvers/zod');
  const { z } = await import('zod');
  const schema = z
    .object({
      account: z.object({
        email: z
          .string()
          .trim()
          .min(1, 'Required email')
          .email('Invalid email')
          .transform((value) => value.toLowerCase()),
      }),
      confirmation: z.string().trim().toLowerCase().min(1, 'Required confirmation'),
      agreed: z.boolean().refine((value) => value, 'Agreement required'),
    })
    .refine((values) => values.account.email === values.confirmation, {
      path: ['confirmation'],
      message: 'Emails must match',
    });
  let methods;
  let submitted;
  let submissions = 0;
  function App() {
    methods = useForm({
      resolver: zodResolver(schema),
      defaultValues: { account: { email: '' }, confirmation: '', agreed: false },
    });
    const fields = [
      ['account.email', 'native'],
      ['confirmation', 'value'],
      ['agreed', 'native'],
    ];
    return h(
      FormProvider,
      methods,
      h(
        'form',
        {
          noValidate: true,
          onSubmit: methods.handleSubmit((values) => {
            submitted = values;
            submissions++;
          }),
        },
        ...fields.map(([name, controlMode]) =>
          h(
            RhfField,
            { key: name, name, controlMode },
            h(RhfField.Label, null, name),
            name === 'agreed' ? h('input', { type: 'checkbox' }) : h(TextField),
            h(RhfField.Hint, null, 'Hint'),
            h(RhfField.Error),
          ),
        ),
      ),
    );
  }
  const field = (name) => host.querySelector(`input[name="${name}"]`);
  const errors = () =>
    Array.from(host.querySelectorAll('[data-field-part="error"]'), (node) => node.textContent);
  const submit = async () =>
    act(async () => {
      host
        .querySelector('form')
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  await render(h(App));
  await submit();
  assert.equal(submissions, 0);
  assert.deepEqual(errors(), ['Required email', 'Required confirmation', 'Agreement required']);
  assert.equal(document.activeElement === field('account.email'), true);
  assert.equal(field('account.email').getAttribute('aria-invalid'), 'true');
  assert.equal(
    document.getElementById(field('account.email').getAttribute('aria-describedby')).textContent,
    'Required email',
  );
  await input(field('account.email'), 'invalid');
  await submit();
  assert.ok(errors().includes('Invalid email'));
  await input(field('account.email'), '  USER@EXAMPLE.COM  ');
  await input(field('confirmation'), 'other@example.com');
  await act(async () => field('agreed').click());
  await submit();
  assert.equal(submissions, 0);
  assert.deepEqual(errors(), ['Emails must match']);
  assert.equal(document.activeElement === field('confirmation'), true);
  await input(field('confirmation'), 'user@example.com');
  await submit();
  assert.equal(submissions, 1);
  assert.deepEqual(submitted, {
    account: { email: 'user@example.com' },
    confirmation: 'user@example.com',
    agreed: true,
  });
  assert.deepEqual(errors(), []);
  assert.equal(methods.getValues('account.email'), '  USER@EXAMPLE.COM  ');
  await act(async () => methods.reset());
  assert.equal(field('account.email').value, '');
  assert.equal(field('confirmation').value, '');
  assert.equal(field('agreed').checked, false);
  assert.deepEqual(errors(), []);
});
