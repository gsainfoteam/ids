import {
  useEffect,
  useState,
  type ComponentProps,
  type FormEventHandler,
  type ReactElement,
} from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { z } from 'zod';

import {
  CheckboxGroup,
  Field,
  Input,
  NumberField,
  PasswordField,
  RadioGroup,
  TelField,
  TextArea,
  TextField,
  useFieldState,
} from '../src';
import { Field as RhfField, type FieldProps as RhfFieldProps } from '../src/react-hook-form';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type Email = string | boolean | string[];
type Profile = { profile: { email: Email } };

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const fieldOf = (control: Locator) => control.element().closest<HTMLElement>('[data-field]')!;
const shellOf = (control: Locator) => control.element().closest<HTMLElement>('[data-text-field]')!;
const errorTexts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-field-part=error]'), (node) => node.textContent);
const settle = () => new Promise((resolve) => setTimeout(resolve));

function rhfHarness({
  field = {},
  control = <TextField />,
  defaultValue = '',
  formDisabled = false,
}: {
  field?: DistributiveOmit<RhfFieldProps, 'name' | 'children'>;
  control?: ReactElement;
  defaultValue?: Email;
  formDisabled?: boolean;
} = {}) {
  let methods!: UseFormReturn<Profile>;
  function App() {
    const form = useForm<Profile>({
      defaultValues: { profile: { email: defaultValue } },
      mode: 'onChange',
      disabled: formDisabled,
    });
    useEffect(() => {
      methods = form;
    });
    return (
      <FormProvider {...form}>
        <RhfField name="profile.email" {...field}>
          <RhfField.Label>Email</RhfField.Label>
          {control}
          <RhfField.Hint>Hint</RhfField.Hint>
          <RhfField.Error />
        </RhfField>
      </FormProvider>
    );
  }
  return { node: <App />, methods: () => methods };
}

function Picker({ id, value }: { id?: string; value: string }) {
  return (
    <span>
      <button id={id} type="button">
        Pick
      </button>
      <input type="hidden" name="pick" value={value} />
    </span>
  );
}

function Custom(props: ComponentProps<'input'>) {
  const state = useFieldState();
  return <input {...props} data-seen={state ? `${state.required}:${state.size}` : 'none'} />;
}

type ValueInputProps = Omit<ComponentProps<'input'>, 'value'> & {
  value?: string;
  onValueChange?: (value: string) => void;
};

function ValueInput({ value, onValueChange, ...rest }: ValueInputProps) {
  return (
    <input {...rest} value={value} onChange={(event) => onValueChange?.(event.target.value)} />
  );
}

type CheckedInputProps = Omit<ComponentProps<'input'>, 'checked'> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function CheckedInput({ checked, onCheckedChange, ...rest }: CheckedInputProps) {
  return (
    <input
      {...rest}
      type="checkbox"
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
    />
  );
}

type GroupProps = {
  name?: string;
  value?: string[];
  onValueChange?: (value: string[]) => void;
  onChange?: FormEventHandler<HTMLDivElement>;
};

function Group({ name, value = [], onValueChange, onChange }: GroupProps) {
  return (
    <div onChange={onChange}>
      {['a', 'b'].map((item) => (
        <input
          key={item}
          type="checkbox"
          name={name}
          value={item}
          checked={value.includes(item)}
          onChange={(event) =>
            onValueChange?.(
              event.target.checked ? [...value, item] : value.filter((entry) => entry !== item),
            )
          }
        />
      ))}
    </div>
  );
}

function Both({ value, onValueChange, onChange, ...rest }: ValueInputProps) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(event) => {
        onValueChange?.(event.target.value.toUpperCase());
        onChange?.(event);
      }}
    />
  );
}

function Shouting({ value, onChange, onValueChange, ...rest }: ValueInputProps) {
  return (
    <input
      {...rest}
      value={String(value).toLowerCase()}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.target.value.toUpperCase());
      }}
    />
  );
}

type LegacyProps = Omit<ComponentProps<'input'>, 'value' | 'onChange'> & {
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
};

function Legacy({ value, onChange, onValueChange: _ignored, ...dom }: LegacyProps) {
  return <input {...dom} value={value} onChange={(event) => onChange?.(event.target.value)} />;
}

function SingleFieldForm({
  name,
  controlMode,
  defaultValue,
  children,
}: {
  name: string;
  controlMode: 'native' | 'value';
  defaultValue: string | number;
  children: ReactElement;
}) {
  const form = useForm({ defaultValues: { [name]: defaultValue } });
  return (
    <FormProvider {...form}>
      <RhfField name={name} controlMode={controlMode}>
        <RhfField.Label>{name}</RhfField.Label>
        {children}
      </RhfField>
    </FormProvider>
  );
}

test('SSR wires generated IDs immediately, without effects', () => {
  const doc = parse(
    renderToString(
      <Field required>
        <Field.Label>Email</Field.Label>
        <TextField />
        <Field.Description>Description</Field.Description>
      </Field>,
    ),
  );
  const input = doc.querySelector('input')!;
  const label = doc.querySelector('label')!;
  expect(label.htmlFor).toBe(input.id);
  expect(input.getAttribute('aria-labelledby')).toBe(label.id);
  expect(input.getAttribute('aria-describedby')).toBe(
    doc.querySelector('[data-field-part=description]')!.id,
  );
});

test('label association, explicit IDs, describedby merge and dynamic error/hint swap', async () => {
  const view = (invalid: boolean) => (
    <Field invalid={invalid} required>
      <>
        <Field.Label id="custom-label">Email</Field.Label>
        <Field.Description>Private</Field.Description>
        <TextField id="custom-input" aria-describedby="external external" />
        <Field.Hint>Hint</Field.Hint>
        <Field.Error>Invalid</Field.Error>
      </>
    </Field>
  );
  const screen = await render(view(false));
  const input = screen.getByRole('textbox');
  const label = screen.getByText('Email', { exact: false });
  await expect.element(label).toHaveAttribute('for', 'custom-input');
  expect((label.element() as HTMLLabelElement).control).toBe(input.element());
  await expect.element(input).toHaveAttribute('aria-labelledby', 'custom-label');
  await expect
    .element(input)
    .toHaveAttribute('aria-describedby', 'external custom-input-description custom-input-hint');
  await expect.element(input).toHaveAttribute('aria-required', 'true');
  await screen.rerender(view(true));
  await expect.element(screen.getByText('Hint')).not.toBeInTheDocument();
  await expect.element(screen.getByText('Invalid')).toHaveAttribute('data-field-part', 'error');
  await expect
    .element(input)
    .toHaveAttribute('aria-describedby', 'external custom-input-description custom-input-error');
  await expect.element(input).toHaveAttribute('aria-invalid', 'true');
  await screen.rerender(
    <Field aria-label="No description">
      <TextField />
    </Field>,
  );
  await expect.element(input).not.toHaveAttribute('aria-describedby');
});

test('asChild uses real custom label IDs and retains its handler and required marker', async () => {
  const onClick = vi.fn();
  const screen = await render(
    <Field required>
      <Field.Label asChild>
        <label id="nested-label" onClick={onClick}>
          Name
        </label>
      </Field.Label>
      <TextField />
    </Field>,
  );
  const input = screen.getByRole('textbox');
  await expect.element(input).toHaveAttribute('aria-labelledby', 'nested-label');
  const label = screen.getByText('Name', { exact: false });
  await userEvent.click(label);
  expect(onClick).toHaveBeenCalledOnce();
  expect((label.element() as HTMLLabelElement).control).toBe(input.element());
  expect(label.element().querySelector('[aria-hidden]')?.textContent).toBe('*');
});

test('Field.Label is a Label that takes the field state, without the Label warnings', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const screen = await render(
      <Field size="tiny" required invalid disabled>
        <Field.Label>Name</Field.Label>
        <TextField />
      </Field>,
    );
    const label = screen.getByText('Name', { exact: false });
    await expect.element(label).toHaveAttribute('data-label');
    for (const name of ['required', 'invalid', 'disabled'])
      await expect.element(label).toHaveAttribute(`data-${name}`);
    await expect.element(label).toHaveClass('text-caption-c1-medium');
    expect(label.element().querySelector('[data-label-required]')?.textContent).toBe('*');
    expect(warn.mock.calls.filter(([message]) => String(message).includes('Label'))).toEqual([]);
  } finally {
    warn.mockRestore();
  }
});

test('a group control keeps the names of its options', async () => {
  const screen = await render(
    <Field>
      <Field.Label>Fruits</Field.Label>
      <CheckboxGroup>
        {({ Item }) =>
          ['apple', 'pear'].map((value) => (
            <label key={value}>
              <Item value={value} />
              {value}
            </label>
          ))
        }
      </CheckboxGroup>
    </Field>,
  );
  await expect
    .element(screen.getByRole('group'))
    .toHaveAttribute('aria-labelledby', screen.getByText('Fruits').element().id);
  for (const name of ['apple', 'pear'])
    await expect
      .element(screen.getByRole('checkbox', { name }))
      .not.toHaveAttribute('aria-labelledby');
});

test('pressing the label of a radio group focuses its checked radio', async () => {
  const screen = await render(
    <Field>
      <Field.Label>Delivery</Field.Label>
      <RadioGroup<string> defaultValue="pickup">
        {({ Item }) =>
          ['parcel', 'pickup'].map((value) => (
            <label key={value}>
              <Item value={value} />
              {value}
            </label>
          ))
        }
      </RadioGroup>
    </Field>,
  );
  await userEvent.click(screen.getByText('Delivery'));
  await expect.element(screen.getByRole('radio', { name: 'pickup' })).toHaveFocus();
});

test('size inheritance, explicit child size, disabled and explicit state override', async () => {
  const screen = await render(
    <Field size="tiny" disabled aria-label="Name">
      <TextField />
    </Field>,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  await expect.element(shellOf(input)).toHaveAttribute('data-size', 'tiny');
  await expect.element(input).toHaveAttribute('disabled');
  await screen.rerender(
    <Field size="tiny" disabled={false} invalid={false} aria-label="Name">
      <TextField size="standard" disabled aria-invalid />
    </Field>,
  );
  await expect.element(shellOf(input)).toHaveAttribute('data-size', 'standard');
  await expect.element(input).not.toHaveAttribute('disabled');
  await expect.element(input).toHaveAttribute('aria-invalid', 'false');
});

test('RHF native nested registration, handlers/ref, error focus and reset', async () => {
  const onChange = vi.fn();
  let refNode: HTMLInputElement | null = null;
  let cleanups = 0;
  const form = rhfHarness({
    field: { registerOptions: { required: 'Enter email' } },
    control: (
      <TextField
        onChange={onChange}
        ref={(node) => {
          refNode = node;
          return () => {
            cleanups++;
          };
        }}
      />
    ),
  });
  const screen = await render(form.node);
  const input = screen.getByRole('textbox', { name: 'Email' });
  expect(refNode).toBe(input.element());
  await form.methods().trigger('profile.email', { shouldFocus: true });
  await expect.element(screen.getByText('Enter email')).toHaveAttribute('data-field-part', 'error');
  await expect.element(screen.getByText('Hint')).not.toBeInTheDocument();
  await expect.element(input).toHaveFocus();
  await userEvent.fill(input, 'user@example.com');
  expect(form.methods().getValues('profile.email')).toBe('user@example.com');
  expect(onChange).toHaveBeenCalledOnce();
  await expect.element(screen.getByText('Enter email')).not.toBeInTheDocument();
  await expect.element(screen.getByText('Hint')).toBeInTheDocument();
  form.methods().reset({ profile: { email: 'reset@example.com' } });
  await expect.element(input).toHaveValue('reset@example.com');
  await screen.unmount();
  expect(cleanups).toBeGreaterThan(0);
});

test('RHF explicit invalid=false overrides an error and disabled form propagates', async () => {
  const form = rhfHarness({ field: { invalid: false, disabled: false }, formDisabled: true });
  const screen = await render(form.node);
  form.methods().setError('profile.email', { message: 'Server error' });
  await expect
    .poll(() => form.methods().formState.errors.profile?.email?.message)
    .toBe('Server error');
  const input = screen.getByRole('textbox', { name: 'Email' });
  await expect.element(input).toHaveAttribute('aria-invalid', 'false');
  await expect.element(screen.getByText('Server error')).not.toBeInTheDocument();
  await expect.element(input).toHaveAttribute('disabled');
});

test('RHF native setValueAs and checkbox registration preserve native semantics', async () => {
  const form = rhfHarness({
    field: { registerOptions: { setValueAs: (value: string) => value.toUpperCase() } },
  });
  const screen = await render(form.node);
  await userEvent.fill(screen.getByRole('textbox', { name: 'Email' }), 'abc');
  expect(form.methods().getValues('profile.email')).toBe('ABC');
  await screen.unmount();
  const check = rhfHarness({ control: <input type="checkbox" />, defaultValue: false });
  const checkScreen = await render(check.node);
  await userEvent.click(checkScreen.getByRole('checkbox', { name: 'Email' }));
  expect(check.methods().getValues('profile.email')).toBe(true);
});

test('RHF controlled value callback supports reset and external setValue', async () => {
  const form = rhfHarness({
    field: { controlMode: 'value' },
    control: <ValueInput />,
    defaultValue: 'initial',
  });
  const screen = await render(form.node);
  const input = screen.getByRole('textbox', { name: 'Email' });
  await expect.element(input).toHaveValue('initial');
  await userEvent.fill(input, 'typed');
  expect(form.methods().getValues('profile.email')).toBe('typed');
  form.methods().setValue('profile.email', 'external');
  await expect.element(input).toHaveValue('external');
  form.methods().reset();
  await expect.element(input).toHaveValue('initial');
});

test('RHF controlled checked callback binds booleans, disabled values omitted on submit', async () => {
  const form = rhfHarness({
    field: { controlMode: 'checked' },
    control: <CheckedInput />,
    defaultValue: false,
  });
  const screen = await render(form.node);
  const box = screen.getByRole('checkbox', { name: 'Email' });
  await userEvent.click(box);
  expect(form.methods().getValues('profile.email')).toBe(true);
  form.methods().reset();
  await expect.element(box).not.toBeChecked();
  await screen.unmount();
  const disabled = rhfHarness({ field: { disabled: true }, defaultValue: 'omit' });
  await render(disabled.node);
  const onValid = vi.fn<(values: Profile) => void>();
  await disabled.methods().handleSubmit(onValid)();
  expect(onValid).toHaveBeenCalledOnce();
  expect(onValid.mock.calls[0][0].profile?.email).toBeUndefined();
});

test('RHF value mode binds onValueChange and ignores change events bubbling from inner inputs', async () => {
  const form = rhfHarness({
    field: { controlMode: 'value' },
    control: <Group />,
    defaultValue: ['a'],
  });
  const screen = await render(form.node);
  const reports: unknown[] = [];
  const subscription = form.methods().watch((values) => {
    reports.push(values.profile?.email);
  });
  await userEvent.click(screen.getByRole('checkbox').nth(1));
  expect(form.methods().getValues('profile.email')).toEqual(['a', 'b']);
  expect(reports).toEqual([['a', 'b']]);
  subscription.unsubscribe();
});

test('RHF value mode reports an edit once when a control fires onValueChange and onChange', async () => {
  const form = rhfHarness({ field: { controlMode: 'value' }, control: <Both /> });
  const screen = await render(form.node);
  const reports: unknown[] = [];
  const subscription = form.methods().watch((values) => {
    reports.push(values.profile?.email);
  });
  await userEvent.fill(screen.getByRole('textbox', { name: 'Email' }), 'ab');
  expect(form.methods().getValues('profile.email')).toBe('AB');
  expect(reports).toEqual(['AB']);
  subscription.unsubscribe();
});

test('optional adapter works without provider and with changing name/context', async () => {
  const screen = await render(
    <RhfField aria-label="Plain">
      <TextField />
    </RhfField>,
  );
  const plain = screen.getByRole('textbox', { name: 'Plain' });
  await userEvent.fill(plain, 'plain');
  await expect.element(plain).toHaveValue('plain');
  function App() {
    const form = useForm({ defaultValues: { first: 'one', second: 'two' } });
    const [name, setName] = useState<'first' | 'second'>('first');
    return (
      <FormProvider {...form}>
        <button onClick={() => setName('second')}>Switch</button>
        <RhfField name={name} aria-label="Dynamic">
          <TextField />
        </RhfField>
      </FormProvider>
    );
  }
  await screen.rerender(<App />);
  const dynamic = screen.getByRole('textbox', { name: 'Dynamic' });
  await expect.element(dynamic).toHaveValue('one');
  await userEvent.click(screen.getByRole('button', { name: 'Switch' }));
  await expect.element(dynamic).toHaveValue('two');
});

test('Zod resolver: nested native + controlled cross-field errors, parsed output, reset', async () => {
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
  type Entered = z.input<typeof schema>;
  type Parsed = z.output<typeof schema>;
  const onValid = vi.fn<(values: Parsed) => void>();
  let methods!: UseFormReturn<Entered, unknown, Parsed>;
  const fields = [
    ['account.email', 'native'],
    ['confirmation', 'value'],
    ['agreed', 'native'],
  ] as const;
  function App() {
    const form = useForm<Entered, unknown, Parsed>({
      resolver: zodResolver(schema),
      defaultValues: { account: { email: '' }, confirmation: '', agreed: false },
    });
    useEffect(() => {
      methods = form;
    });
    return (
      <FormProvider {...form}>
        <form noValidate onSubmit={form.handleSubmit(onValid)}>
          {fields.map(([name, controlMode]) => (
            <RhfField key={name} name={name} controlMode={controlMode}>
              <RhfField.Label>{name}</RhfField.Label>
              {name === 'agreed' ? <input type="checkbox" /> : <TextField />}
              <RhfField.Hint>Hint</RhfField.Hint>
              <RhfField.Error />
            </RhfField>
          ))}
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const email = screen.getByRole('textbox', { name: 'account.email' });
  const confirmation = screen.getByRole('textbox', { name: 'confirmation' });
  const agreed = screen.getByRole('checkbox', { name: 'agreed' });
  const submit = screen.getByRole('button', { name: 'Submit' });
  const errors = () => errorTexts(screen.container);

  await userEvent.click(submit);
  await expect
    .poll(errors)
    .toEqual(['Required email', 'Required confirmation', 'Agreement required']);
  expect(onValid).not.toHaveBeenCalled();
  await expect.element(email).toHaveFocus();
  await expect.element(email).toHaveAttribute('aria-invalid', 'true');
  await expect.element(email).toHaveAccessibleDescription('Required email');
  await userEvent.fill(email, 'invalid');
  await userEvent.click(submit);
  await expect.poll(errors).toContain('Invalid email');
  await userEvent.fill(email, '  USER@EXAMPLE.COM  ');
  await userEvent.fill(confirmation, 'other@example.com');
  await userEvent.click(agreed);
  await userEvent.click(submit);
  await expect.poll(errors).toEqual(['Emails must match']);
  expect(onValid).not.toHaveBeenCalled();
  await expect.element(confirmation).toHaveFocus();
  await userEvent.fill(confirmation, 'user@example.com');
  await userEvent.click(submit);
  await expect.poll(() => onValid.mock.calls.length).toBe(1);
  expect(onValid.mock.calls[0][0]).toEqual({
    account: { email: 'user@example.com' },
    confirmation: 'user@example.com',
    agreed: true,
  });
  await expect.poll(errors).toEqual([]);
  expect(methods.getValues('account.email')).toBe('  USER@EXAMPLE.COM  ');
  methods.reset();
  await expect.element(email).toHaveValue('');
  await expect.element(confirmation).toHaveValue('');
  await expect.element(agreed).not.toBeChecked();
  expect(errors()).toEqual([]);
});

test('state attributes follow the control on the root and every part', async () => {
  const screen = await render(
    <Field>
      <Field.Label>Name</Field.Label>
      <TextField defaultValue="" />
      <Field.Hint>Hint</Field.Hint>
    </Field>,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  const root = fieldOf(input);
  await expect.element(root).toHaveAttribute('data-orientation', 'vertical');
  await expect.element(root).not.toHaveAttribute('data-filled');
  await userEvent.click(input);
  await expect.element(root).toHaveAttribute('data-focused');
  await expect.element(screen.getByText('Name')).toHaveAttribute('data-focused');
  await expect.element(root).not.toHaveAttribute('data-touched');
  await userEvent.fill(input, 'a');
  await expect.element(root).toHaveAttribute('data-filled');
  await expect.element(root).toHaveAttribute('data-dirty');
  input.element().blur();
  await expect.element(root).not.toHaveAttribute('data-focused');
  await expect.element(root).toHaveAttribute('data-touched');
  await userEvent.clear(input);
  await expect.element(root).not.toHaveAttribute('data-dirty');
  await expect.element(root).not.toHaveAttribute('data-filled');
});

test('filled reads checked boxes and the hidden inputs a custom control writes', async () => {
  const screen = await render(
    <Field aria-label="Agree">
      <input type="checkbox" />
    </Field>,
  );
  const root = () => screen.container.querySelector<HTMLElement>('[data-field]')!;
  await expect.element(root()).not.toHaveAttribute('data-filled');
  await userEvent.click(screen.getByRole('checkbox', { name: 'Agree' }));
  await expect.element(root()).toHaveAttribute('data-filled');
  await expect.element(root()).toHaveAttribute('data-dirty');
  await screen.rerender(
    <Field key="picker" aria-label="Pick">
      <Picker value="" />
    </Field>,
  );
  await expect.element(root()).not.toHaveAttribute('data-filled');
  await screen.rerender(
    <Field key="picker" aria-label="Pick">
      <Picker value="a" />
    </Field>,
  );
  await expect.element(root()).toHaveAttribute('data-filled');
  await expect.element(root()).toHaveAttribute('data-dirty');
});

test('orientation lays the label beside the control; variant stays as an alias', async () => {
  const screen = await render(
    <Field orientation="horizontal" aria-label="x">
      <TextField />
    </Field>,
  );
  const root = () => screen.container.querySelector<HTMLElement>('[data-field]')!;
  await expect.element(root()).toHaveAttribute('data-orientation', 'horizontal');
  await expect.element(root()).toHaveClass('grid-cols-[auto_minmax(0,1fr)]');
  await screen.rerender(
    <Field variant="horizontal" aria-label="x">
      <TextField />
    </Field>,
  );
  await expect.element(root()).toHaveAttribute('data-orientation', 'horizontal');
});

test('native validation: an invalid event shows the message, editing clears it', async () => {
  const screen = await render(
    <form>
      <Field>
        <Field.Label>Email</Field.Label>
        <TextField type="email" required />
        <Field.Hint>Work email</Field.Hint>
        <Field.Error />
      </Field>
    </form>,
  );
  const input = screen.getByRole('textbox', { name: 'Email' });
  expect(screen.container.querySelector('[data-field-part=error]')).toBeNull();
  screen.container.querySelector('form')!.checkValidity();
  const error = screen.getByText((input.element() as HTMLInputElement).validationMessage);
  await expect.element(error).toHaveAttribute('data-field-part', 'error');
  await expect.element(input).toHaveAttribute('aria-invalid', 'true');
  await expect.element(fieldOf(input)).toHaveAttribute('data-invalid');
  await expect.element(screen.getByText('Work email')).not.toBeInTheDocument();
  await expect.element(input).toHaveAttribute('aria-describedby', error.element().id);
  await userEvent.fill(input, 'user@example.com');
  await expect.element(error).not.toBeInTheDocument();
  await expect.element(input).not.toHaveAttribute('aria-invalid');
  await expect
    .element(input)
    .toHaveAttribute('aria-describedby', screen.getByText('Work email').element().id);
});

test('native validation on blur only reports a value the user changed', async () => {
  const screen = await render(
    <form>
      <Field>
        <Field.Label>Email</Field.Label>
        <TextField type="email" required />
        <Field.Error />
      </Field>
    </form>,
  );
  const input = screen.getByRole('textbox', { name: 'Email' });
  const root = fieldOf(input);
  const errorPart = () => screen.container.querySelector('[data-field-part=error]');
  await userEvent.click(input);
  input.element().blur();
  await expect.element(root).toHaveAttribute('data-touched');
  expect(errorPart()).toBeNull();
  await userEvent.fill(input, 'nope');
  await expect.element(root).toHaveAttribute('data-dirty');
  expect(errorPart()).toBeNull();
  input.element().blur();
  await expect
    .element(screen.getByText((input.element() as HTMLInputElement).validationMessage))
    .toHaveAttribute('data-field-part', 'error');
});

test('custom validity, match, noValidate and explicit invalid', async () => {
  const screen = await render(
    <form>
      <Field>
        <Field.Label>Email</Field.Label>
        <TextField type="email" required />
        <Field.Error match="valueMissing">Required</Field.Error>
        <Field.Error match="typeMismatch">Not an email</Field.Error>
        <Field.Error match="customError" />
      </Field>
    </form>,
  );
  const input = screen.getByRole('textbox', { name: 'Email' });
  const form = () => screen.container.querySelector('form')!;
  const errors = () => errorTexts(screen.container);
  form().checkValidity();
  await expect.poll(errors).toEqual(['Required']);
  await userEvent.fill(input, 'x');
  await expect.poll(errors).toEqual(['Not an email']);
  const ids = Array.from(
    screen.container.querySelectorAll('[data-field-part=error]'),
    (node) => node.id,
  );
  await expect.element(input).toHaveAttribute('aria-describedby', ids.join(' '));
  (input.element() as HTMLInputElement).setCustomValidity('Taken');
  await userEvent.fill(input, 'a@b.co');
  await expect.poll(errors).toEqual(['Taken']);

  await screen.rerender(
    <form key="novalidate" noValidate>
      <Field>
        <Field.Label>Email</Field.Label>
        <TextField required />
        <Field.Error />
      </Field>
    </form>,
  );
  form().checkValidity();
  await settle();
  expect(errors()).toEqual([]);

  await screen.rerender(
    <form key="explicit">
      <Field invalid={false}>
        <Field.Label>Email</Field.Label>
        <TextField required />
        <Field.Error />
      </Field>
    </form>,
  );
  form().checkValidity();
  await settle();
  expect(errors()).toEqual([]);
});

test('an error without content renders nothing and is left out of aria-describedby', async () => {
  const screen = await render(
    <Field invalid>
      <Field.Label>Name</Field.Label>
      <TextField />
      <Field.Error />
    </Field>,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  expect(screen.container.querySelector('[data-field-part=error]')).toBeNull();
  await expect.element(input).not.toHaveAttribute('aria-describedby');
  await expect.element(input).toHaveAttribute('aria-invalid', 'true');
});

test('native form reset clears touched, dirty and the shown error', async () => {
  const screen = await render(
    <form>
      <Field>
        <Field.Label>Name</Field.Label>
        <TextField required defaultValue="" />
        <Field.Error />
      </Field>
      <button type="reset">Reset</button>
    </form>,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  const root = fieldOf(input);
  screen.container.querySelector('form')!.checkValidity();
  await userEvent.fill(input, 'typed');
  input.element().blur();
  await expect.element(root).toHaveAttribute('data-dirty');
  await expect.element(root).toHaveAttribute('data-touched');
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(input).toHaveValue('');
  await expect.element(root).not.toHaveAttribute('data-dirty');
  await expect.element(root).not.toHaveAttribute('data-touched');
  expect(screen.container.querySelector('[data-field-part=error]')).toBeNull();
});

test('className, style and children accept a function of the field state', async () => {
  const screen = await render(
    <Field
      required
      className={(state) => (state.focused ? 'is-focused' : 'is-idle')}
      style={(state) => ({ opacity: state.filled ? 1 : 0.5 })}
    >
      <Field.Label className={(state) => (state.required ? 'needs' : '')}>Name</Field.Label>
      <TextField />
      <Field.Description>{(state) => (state.filled ? 'Filled' : 'Empty')}</Field.Description>
    </Field>,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  const root = fieldOf(input);
  const description = screen.getByText('Empty').element();
  await expect.element(root).toHaveClass('is-idle');
  await expect.element(root).toHaveStyle({ opacity: '0.5' });
  await expect.element(screen.getByText('Name', { exact: false })).toHaveClass('needs');
  await expect.element(description).toHaveTextContent('Empty');
  await userEvent.fill(input, 'a');
  await expect.element(root).toHaveClass('is-focused');
  await expect.element(root).toHaveStyle({ opacity: '1' });
  await expect.element(description).toHaveTextContent('Filled');
});

test('useFieldState exposes the state to a custom control', async () => {
  const screen = await render(
    <Field required size="tiny" aria-label="Custom">
      <Custom />
    </Field>,
  );
  const input = screen.getByRole('textbox');
  await expect.element(input).toHaveAttribute('data-seen', 'true:tiny');
  await screen.rerender(<Custom key="outside" />);
  await expect.element(input).toHaveAttribute('data-seen', 'none');
});

test('RHF passes its own dirty and touched state and keeps native errors reachable', async () => {
  const form = rhfHarness();
  const screen = await render(form.node);
  const input = screen.getByRole('textbox', { name: 'Email' });
  const root = fieldOf(input);
  await userEvent.fill(input, 'user@example.com');
  input.element().blur();
  await expect.element(root).toHaveAttribute('data-dirty');
  await expect.element(root).toHaveAttribute('data-touched');
  form.methods().reset();
  await expect.element(root).not.toHaveAttribute('data-dirty');
  await expect.element(root).not.toHaveAttribute('data-touched');
});

test('RHF value mode takes onValueChange over a forwarded change event, and a value-first onChange', async () => {
  const shouting = rhfHarness({
    field: { controlMode: 'value' },
    control: <Shouting />,
    defaultValue: 'a',
  });
  const shoutingScreen = await render(shouting.node);
  await userEvent.fill(shoutingScreen.getByRole('textbox', { name: 'Email' }), 'hello');
  expect(shouting.methods().getValues('profile.email')).toBe('HELLO');
  await shoutingScreen.unmount();

  const legacy = rhfHarness({ field: { controlMode: 'value' }, control: <Legacy /> });
  const legacyScreen = await render(legacy.node);
  await userEvent.fill(legacyScreen.getByRole('textbox', { name: 'Email' }), 'typed');
  expect(legacy.methods().getValues('profile.email')).toBe('typed');
  await legacyScreen.unmount();

  const native = rhfHarness({ field: { controlMode: 'value' }, control: <input /> });
  const nativeScreen = await render(native.node);
  await userEvent.fill(nativeScreen.getByRole('textbox', { name: 'Email' }), 'plain');
  expect(native.methods().getValues('profile.email')).toBe('plain');
});

test('RHF value mode binds onValueChange on TextField', async () => {
  const form = rhfHarness({ field: { controlMode: 'value' }, defaultValue: 'x' });
  const screen = await render(form.node);
  const input = screen.getByRole('textbox', { name: 'Email' });
  await expect.element(input).toHaveValue('x');
  await userEvent.fill(input, 'user@example.com');
  expect(form.methods().getValues('profile.email')).toBe('user@example.com');
});

test('RHF native and value modes give the text fields no prop the DOM does not know', async () => {
  const cases: Array<['native' | 'value', string, ReactElement, string | number]> = [
    ['native', 'text', <TextField />, 'a'],
    ['native', 'area', <TextArea />, 'a'],
    ['native', 'password', <PasswordField name="password" />, 'a'],
    ['native', 'email', <Input type="email" />, 'a'],
    ['value', 'text', <TextField />, 'a'],
    ['value', 'area', <TextArea />, 'a'],
    ['value', 'password', <PasswordField name="password" />, 'a'],
    ['value', 'number', <NumberField />, 1],
    ['value', 'tel', <TelField />, '+821012345678'],
    ['value', 'quantity', <Input type="number" />, 2],
  ];
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    for (const [controlMode, name, control, defaultValue] of cases) {
      const screen = await render(
        <SingleFieldForm name={name} controlMode={controlMode} defaultValue={defaultValue}>
          {control}
        </SingleFieldForm>,
      );
      await screen.unmount();
    }
    expect(error.mock.calls).toEqual([]);
  } finally {
    error.mockRestore();
  }
});
