import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const name of [
  'window',
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Event',
  'MouseEvent',
  'FocusEvent',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState, Fragment } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Field, TextField, useFieldState } = await import('../dist/index.js');
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
const fieldRoot = () => host.querySelector('[data-field]');
const has = (node, name) => node.hasAttribute(`data-${name}`);
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

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
test('Field.Label is a Label that takes the field state, without the Label warnings', async () => {
  const warnings = [];
  const original = console.warn;
  console.warn = (...args) => warnings.push(args.map(String).join(' '));
  try {
    await render(
      h(
        Field,
        { size: 'tiny', required: true, invalid: true, disabled: true },
        h(Field.Label, null, 'Name'),
        h(TextField),
      ),
    );
  } finally {
    console.warn = original;
  }
  const label = part('label');
  assert.ok(label.hasAttribute('data-label'));
  for (const name of ['required', 'invalid', 'disabled']) assert.ok(has(label, name), name);
  assert.match(label.className, /text-caption-c1-medium/);
  assert.equal(label.querySelector('[data-label-required]').textContent, '*');
  assert.deepEqual(
    warnings.filter((warning) => warning.includes('Label')),
    [],
  );
});
test('a group control keeps the names of its options', async () => {
  const { CheckboxGroup } = await import('../dist/index.js');
  await render(
    h(
      Field,
      null,
      h(Field.Label, null, 'Fruits'),
      h(CheckboxGroup, null, ({ Item }) =>
        ['apple', 'pear'].map((value) => h('label', { key: value }, h(Item, { value }), value)),
      ),
    ),
  );
  await act(settle);
  assert.equal(
    host.querySelector('[role=group]').getAttribute('aria-labelledby'),
    part('label').id,
  );
  for (const box of host.querySelectorAll('input[type=checkbox]'))
    assert.equal(box.hasAttribute('aria-labelledby'), false, 'an option keeps its own label');
});
test('pressing the label of a radio group focuses its checked radio', async () => {
  const { RadioGroup } = await import('../dist/index.js');
  await render(
    h(
      Field,
      null,
      h(Field.Label, null, 'Delivery'),
      h(RadioGroup, { defaultValue: 'pickup' }, ({ Item }) =>
        ['parcel', 'pickup'].map((value) => h('label', { key: value }, h(Item, { value }), value)),
      ),
    ),
  );
  await act(async () => part('label').click());
  assert.equal(document.activeElement, host.querySelector('input[value=pickup]'));
});
test('size inheritance, explicit child size, disabled and explicit state override', async () => {
  await render(h(Field, { size: 'tiny', disabled: true, 'aria-label': 'Name' }, h(TextField)));
  assert.equal(control().closest('[data-text-field]').dataset.size, 'tiny');
  assert.equal(control().disabled, true);
  await render(
    h(
      Field,
      { size: 'tiny', disabled: false, invalid: false, 'aria-label': 'Name' },
      h(TextField, { size: 'standard', disabled: true, 'aria-invalid': true }),
    ),
  );
  assert.equal(control().closest('[data-text-field]').dataset.size, 'standard');
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
  function ValueInput({ value, onValueChange, ...rest }) {
    return h('input', { ...rest, value, onChange: (event) => onValueChange(event.target.value) });
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
  function CheckedInput({ checked, onCheckedChange, ...rest }) {
    return h('input', {
      ...rest,
      type: 'checkbox',
      checked,
      onChange: (event) => onCheckedChange(event.target.checked),
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
test('RHF value mode binds onValueChange and ignores change events bubbling from inner inputs', async () => {
  function Group({ value, onValueChange, onChange, name }) {
    return h(
      'div',
      { onChange },
      ['a', 'b'].map((item) =>
        h('input', {
          key: item,
          type: 'checkbox',
          name,
          value: item,
          checked: value.includes(item),
          onChange: (event) =>
            onValueChange(
              event.target.checked ? [...value, item] : value.filter((entry) => entry !== item),
            ),
        }),
      ),
    );
  }
  const form = rhfHarness({
    mode: 'value',
    child: h(Group),
    defaultValues: { profile: { email: ['a'] } },
  });
  await render(form.node);
  const reports = [];
  const subscription = form.methods().watch((values) => reports.push(values.profile.email));
  await act(async () => host.querySelectorAll('input[type=checkbox]')[1].click());
  assert.deepEqual(form.methods().getValues('profile.email'), ['a', 'b']);
  assert.deepEqual(reports, [['a', 'b']], 'the bubbled checkbox event is not a second report');
  subscription.unsubscribe();
});
test('RHF value mode reports an edit once when a control fires onValueChange and onChange', async () => {
  function Both({ value, onValueChange, onChange, ...rest }) {
    return h('input', {
      ...rest,
      value,
      onChange: (event) => {
        onValueChange(event.target.value.toUpperCase());
        onChange(event);
      },
    });
  }
  const form = rhfHarness({
    mode: 'value',
    child: h(Both),
    defaultValues: { profile: { email: '' } },
  });
  await render(form.node);
  const reports = [];
  const subscription = form.methods().watch((values) => reports.push(values.profile.email));
  await input(control(), 'ab');
  assert.equal(form.methods().getValues('profile.email'), 'AB');
  assert.deepEqual(reports, ['AB']);
  subscription.unsubscribe();
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

test('state attributes follow the control on the root and every part', async () => {
  await render(
    h(
      Field,
      null,
      h(Field.Label, null, 'Name'),
      h(TextField, { defaultValue: '' }),
      h(Field.Hint, null, 'Hint'),
    ),
  );
  assert.equal(fieldRoot().dataset.orientation, 'vertical');
  assert.equal(has(fieldRoot(), 'filled'), false);
  await act(async () => control().focus());
  assert.ok(has(fieldRoot(), 'focused'));
  assert.ok(has(part('label'), 'focused'), 'parts carry the same state');
  assert.equal(has(fieldRoot(), 'touched'), false);
  await input(control(), 'a');
  assert.ok(has(fieldRoot(), 'filled'));
  assert.ok(has(fieldRoot(), 'dirty'));
  await act(async () => control().blur());
  assert.equal(has(fieldRoot(), 'focused'), false);
  assert.ok(has(fieldRoot(), 'touched'));
  await input(control(), '');
  assert.equal(has(fieldRoot(), 'dirty'), false, 'back to the initial value is not dirty');
  assert.equal(has(fieldRoot(), 'filled'), false);
});

test('filled reads checked boxes and the hidden inputs a custom control writes', async () => {
  await render(h(Field, { 'aria-label': 'Agree' }, h('input', { type: 'checkbox' })));
  assert.equal(has(fieldRoot(), 'filled'), false);
  await act(async () => control().click());
  assert.ok(has(fieldRoot(), 'filled'));
  assert.ok(has(fieldRoot(), 'dirty'));
  function Picker({ id, value }) {
    return h(
      'span',
      null,
      h('button', { id, type: 'button' }, 'Pick'),
      h('input', { type: 'hidden', name: 'pick', value }),
    );
  }
  await render(h(Field, { key: 'picker', 'aria-label': 'Pick' }, h(Picker, { value: '' })));
  assert.equal(has(fieldRoot(), 'filled'), false);
  await render(h(Field, { key: 'picker', 'aria-label': 'Pick' }, h(Picker, { value: 'a' })));
  assert.ok(has(fieldRoot(), 'filled'), 'a re-render with a new hidden value is picked up');
  assert.ok(has(fieldRoot(), 'dirty'));
});

test('orientation lays the label beside the control; variant stays as an alias', async () => {
  await render(h(Field, { orientation: 'horizontal', 'aria-label': 'x' }, h(TextField)));
  assert.equal(fieldRoot().dataset.orientation, 'horizontal');
  assert.ok(fieldRoot().className.includes('grid-cols-[auto_minmax(0,1fr)]'));
  await render(h(Field, { variant: 'horizontal', 'aria-label': 'x' }, h(TextField)));
  assert.equal(fieldRoot().dataset.orientation, 'horizontal');
});

test('native validation: an invalid event shows the message, editing clears it', async () => {
  await render(
    h(
      'form',
      null,
      h(
        Field,
        null,
        h(Field.Label, null, 'Email'),
        h(TextField, { type: 'email', required: true }),
        h(Field.Hint, null, 'Work email'),
        h(Field.Error),
      ),
    ),
  );
  const form = host.querySelector('form');
  assert.equal(part('error'), null, 'nothing is reported before the user submits');
  await act(async () => form.checkValidity());
  assert.equal(part('error').textContent, control().validationMessage);
  assert.equal(control().getAttribute('aria-invalid'), 'true');
  assert.ok(has(fieldRoot(), 'invalid'));
  assert.equal(part('hint'), null);
  assert.equal(control().getAttribute('aria-describedby'), part('error').id);
  await input(control(), 'user@example.com');
  assert.equal(part('error'), null, 'the error follows edits once shown');
  assert.equal(control().hasAttribute('aria-invalid'), false);
  assert.equal(control().getAttribute('aria-describedby'), part('hint').id);
});

test('native validation on blur only reports a value the user changed', async () => {
  await render(
    h(
      'form',
      null,
      h(
        Field,
        null,
        h(Field.Label, null, 'Email'),
        h(TextField, { type: 'email', required: true }),
        h(Field.Error),
      ),
    ),
  );
  await act(async () => control().focus());
  await act(async () => control().blur());
  assert.equal(part('error'), null, 'an empty required field tabbed past is not an error yet');
  await act(async () => control().focus());
  await input(control(), 'nope');
  assert.equal(part('error'), null, 'typing does not report before the first blur');
  await act(async () => control().blur());
  assert.equal(part('error').textContent, control().validationMessage);
});

test('custom validity, match, noValidate and explicit invalid', async () => {
  let node;
  await render(
    h(
      'form',
      null,
      h(
        Field,
        null,
        h(Field.Label, null, 'Email'),
        h(TextField, { type: 'email', required: true, ref: (value) => (node = value) }),
        h(Field.Error, { match: 'valueMissing' }, 'Required'),
        h(Field.Error, { match: 'typeMismatch' }, 'Not an email'),
        h(Field.Error, { match: 'customError' }),
      ),
    ),
  );
  const form = host.querySelector('form');
  const errors = () =>
    [...host.querySelectorAll('[data-field-part=error]')].map((el) => el.textContent);
  await act(async () => form.checkValidity());
  assert.deepEqual(errors(), ['Required']);
  await input(control(), 'x');
  assert.deepEqual(errors(), ['Not an email']);
  const ids = [...host.querySelectorAll('[data-field-part=error]')].map((el) => el.id);
  assert.equal(control().getAttribute('aria-describedby'), ids.join(' '));
  await act(async () => node.setCustomValidity('Taken'));
  await input(control(), 'a@b.co');
  assert.deepEqual(errors(), ['Taken'], 'a match without children shows the browser message');

  await render(
    h(
      'form',
      { key: 'novalidate', noValidate: true },
      h(
        Field,
        null,
        h(Field.Label, null, 'Email'),
        h(TextField, { required: true }),
        h(Field.Error),
      ),
    ),
  );
  await act(async () => host.querySelector('form').checkValidity());
  assert.equal(part('error'), null, 'noValidate keeps the field out of native validation');

  await render(
    h(
      'form',
      { key: 'explicit' },
      h(
        Field,
        { invalid: false },
        h(Field.Label, null, 'Email'),
        h(TextField, { required: true }),
        h(Field.Error),
      ),
    ),
  );
  await act(async () => host.querySelector('form').checkValidity());
  assert.equal(part('error'), null, 'an explicit invalid wins over native validity');
});

test('an error without content renders nothing and is left out of aria-describedby', async () => {
  await render(
    h(Field, { invalid: true }, h(Field.Label, null, 'Name'), h(TextField), h(Field.Error)),
  );
  assert.equal(part('error'), null);
  assert.equal(control().getAttribute('aria-describedby'), null);
  assert.equal(control().getAttribute('aria-invalid'), 'true');
});

test('native form reset clears touched, dirty and the shown error', async () => {
  await render(
    h(
      'form',
      null,
      h(
        Field,
        null,
        h(Field.Label, null, 'Name'),
        h(TextField, { required: true, defaultValue: '' }),
        h(Field.Error),
      ),
    ),
  );
  await act(async () => host.querySelector('form').checkValidity());
  await act(async () => control().focus());
  await input(control(), 'typed');
  await act(async () => control().blur());
  assert.ok(has(fieldRoot(), 'dirty') && has(fieldRoot(), 'touched'));
  await act(async () => {
    host.querySelector('form').reset();
    await settle();
  });
  assert.equal(control().value, '');
  assert.equal(has(fieldRoot(), 'dirty'), false);
  assert.equal(has(fieldRoot(), 'touched'), false);
  assert.equal(part('error'), null);
});

test('className, style and children accept a function of the field state', async () => {
  await render(
    h(
      Field,
      {
        required: true,
        className: (state) => (state.focused ? 'is-focused' : 'is-idle'),
        style: (state) => ({ opacity: state.filled ? 1 : 0.5 }),
      },
      h(Field.Label, { className: (state) => (state.required ? 'needs' : '') }, 'Name'),
      h(TextField),
      h(Field.Description, null, (state) => (state.filled ? 'Filled' : 'Empty')),
    ),
  );
  assert.ok(fieldRoot().classList.contains('is-idle'));
  assert.equal(fieldRoot().style.opacity, '0.5');
  assert.ok(part('label').classList.contains('needs'));
  assert.equal(part('description').textContent, 'Empty');
  await act(async () => control().focus());
  await input(control(), 'a');
  assert.ok(fieldRoot().classList.contains('is-focused'));
  assert.equal(fieldRoot().style.opacity, '1');
  assert.equal(part('description').textContent, 'Filled');
});

test('useFieldState exposes the state to a custom control', async () => {
  function Custom(props) {
    const state = useFieldState();
    return h('input', {
      ...props,
      'data-seen': state ? `${state.required}:${state.size}` : 'none',
    });
  }
  await render(h(Field, { required: true, size: 'tiny', 'aria-label': 'Custom' }, h(Custom)));
  assert.equal(control().dataset.seen, 'true:tiny');
  await render(h(Custom, { key: 'outside' }));
  assert.equal(control().dataset.seen, 'none');
});

test('RHF passes its own dirty and touched state and keeps native errors reachable', async () => {
  const form = rhfHarness();
  await render(form.node);
  await act(async () => control().focus());
  await input(control(), 'user@example.com');
  await act(async () => control().blur());
  assert.ok(has(fieldRoot(), 'dirty'));
  assert.ok(has(fieldRoot(), 'touched'));
  await act(async () => form.methods().reset());
  assert.equal(has(fieldRoot(), 'dirty'), false);
  assert.equal(has(fieldRoot(), 'touched'), false);
});

test('RHF value mode takes onValueChange over a forwarded change event, and a value-first onChange', async () => {
  // Reports the change event of its own input as onChange, and the value it means as
  // onValueChange: RHF must store the latter.
  function Shouting({ value, onChange, onValueChange, ...rest }) {
    return h('input', {
      ...rest,
      value: String(value).toLowerCase(),
      onChange: (event) => {
        onChange?.(event);
        onValueChange?.(event.target.value.toUpperCase());
      },
    });
  }
  const shouting = rhfHarness({
    mode: 'value',
    child: h(Shouting),
    defaultValues: { profile: { email: 'a' } },
  });
  await render(shouting.node);
  await input(control(), 'hello');
  assert.equal(shouting.methods().getValues('profile.email'), 'HELLO');
  await act(async () => root.unmount());
  root = undefined;

  function Legacy({ value, onChange, ...rest }) {
    const { onValueChange: _ignored, ...dom } = rest;
    return h('input', { ...dom, value, onChange: (event) => onChange(event.target.value) });
  }
  const legacy = rhfHarness({
    mode: 'value',
    child: h(Legacy),
    defaultValues: { profile: { email: '' } },
  });
  await render(legacy.node);
  await input(control(), 'typed');
  assert.equal(legacy.methods().getValues('profile.email'), 'typed');
  await act(async () => root.unmount());
  root = undefined;

  const native = rhfHarness({
    mode: 'value',
    child: h('input'),
    defaultValues: { profile: { email: '' } },
  });
  await render(native.node);
  await input(control(), 'plain');
  assert.equal(
    native.methods().getValues('profile.email'),
    'plain',
    'a native input still reports its event',
  );
});

test('RHF value mode binds onValueChange on TextField', async () => {
  const form = rhfHarness({ mode: 'value', defaultValues: { profile: { email: 'x' } } });
  await render(form.node);
  assert.equal(control().value, 'x');
  await input(control(), 'user@example.com');
  assert.equal(form.methods().getValues('profile.email'), 'user@example.com');
});

test('RHF native and value modes give the text fields no prop the DOM does not know', async () => {
  const { TextArea, PasswordField, NumberField, TelField, Input } =
    await import('../dist/index.js');
  const controls = {
    native: [
      ['text', h(TextField), 'a'],
      ['area', h(TextArea), 'a'],
      ['password', h(PasswordField, { name: 'password' }), 'a'],
      ['email', h(Input, { type: 'email' }), 'a'],
    ],
    value: [
      ['text', h(TextField), 'a'],
      ['area', h(TextArea), 'a'],
      ['password', h(PasswordField, { name: 'password' }), 'a'],
      ['number', h(NumberField), 1],
      ['tel', h(TelField), '+821012345678'],
      ['quantity', h(Input, { type: 'number' }), 2],
    ],
  };
  const errors = [];
  const original = console.error;
  console.error = (...args) => errors.push(args.map(String).join(' '));
  try {
    for (const [mode, list] of Object.entries(controls))
      for (const [name, element, value] of list) {
        function App() {
          const methods = useForm({ defaultValues: { [name]: value } });
          return h(
            FormProvider,
            methods,
            h(RhfField, { name, controlMode: mode }, h(RhfField.Label, null, name), element),
          );
        }
        await render(h(App, { key: `${mode}-${name}` }));
      }
  } finally {
    console.error = original;
  }
  assert.deepEqual(errors, []);
});
