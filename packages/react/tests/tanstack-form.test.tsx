import { useEffect } from 'react';

import { createFormHook, createFormHookContexts, useForm } from '@tanstack/react-form';
import { expect, test, vi } from 'vitest';
import { type Locator } from 'vitest/browser';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Checkbox, TextField } from '../src';
import { Field } from '../src/tanstack-form';

const fieldOf = (control: Locator) => control.element().closest<HTMLElement>('[data-field]')!;

const mustBeEmail = ({ value }: { value: string }) =>
  value.includes('@') ? undefined : 'Enter an email address';

type StepperProps = {
  id?: string;
  value?: number;
  onValueChange?: (value: number) => void;
  onBlur?: () => void;
};

function Stepper({ id, value = 0, onValueChange, onBlur }: StepperProps) {
  return (
    <button id={id} type="button" onBlur={onBlur} onClick={() => onValueChange?.(value + 1)}>
      {String(value)}
    </button>
  );
}

test('form.Field: typing reaches the form, and a blur shows the error on the field', async () => {
  const useEmailForm = () => useForm({ defaultValues: { email: '' } });
  let form!: ReturnType<typeof useEmailForm>;
  function App() {
    const api = useEmailForm();
    useEffect(() => {
      form = api;
    });
    return (
      <api.Field name="email" validators={{ onBlur: mustBeEmail }}>
        {(field) => (
          <Field field={field}>
            <Field.Label>Email</Field.Label>
            <TextField />
            <Field.Error />
          </Field>
        )}
      </api.Field>
    );
  }
  const screen = await render(<App />);
  const input = screen.getByRole('textbox', { name: 'Email' });
  await expect.element(input).toHaveAttribute('name', 'email');
  await expect.element(screen.getByText('Email')).toHaveAttribute('for', input.element().id);
  await userEvent.fill(input, 'ids');
  expect(form.state.values.email).toBe('ids');
  const field = fieldOf(input);
  await expect.element(field).toHaveAttribute('data-dirty');
  await expect.element(field).not.toHaveAttribute('data-invalid');
  input.element().blur();
  await expect.element(field).toHaveAttribute('data-touched');
  await expect.element(field).toHaveAttribute('data-invalid');
  await expect
    .element(screen.getByText('Enter an email address'))
    .toHaveAttribute('data-field-part', 'error');
  await expect.element(input).toHaveAttribute('aria-invalid', 'true');
  await userEvent.fill(input, 'ids@gist.ac.kr');
  input.element().blur();
  await expect.element(field).not.toHaveAttribute('data-invalid');
  form.reset();
  await expect.element(input).toHaveValue('');
  await expect.element(field).not.toHaveAttribute('data-dirty');
});

test('an error found by a submit shows before the field was touched', async () => {
  const useEmailForm = () => useForm({ defaultValues: { email: '' }, onSubmit: () => {} });
  let form!: ReturnType<typeof useEmailForm>;
  function App() {
    const api = useEmailForm();
    useEffect(() => {
      form = api;
    });
    return (
      <api.Field name="email" validators={{ onSubmit: mustBeEmail }}>
        {(field) => (
          <Field field={field}>
            <Field.Label>Email</Field.Label>
            <TextField />
            <Field.Error />
          </Field>
        )}
      </api.Field>
    );
  }
  const screen = await render(<App />);
  const field = fieldOf(screen.getByRole('textbox', { name: 'Email' }));
  await expect.element(field).not.toHaveAttribute('data-invalid');
  await form.handleSubmit();
  await expect.element(field).toHaveAttribute('data-invalid');
  await expect
    .element(screen.getByText('Enter an email address'))
    .toHaveAttribute('data-field-part', 'error');
});

test('form.AppField: Field finds its field without a prop, in value and checked modes', async () => {
  const { fieldContext, formContext } = createFormHookContexts();
  const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: { Field },
    formComponents: {},
  });
  const useSettingsForm = () => useAppForm({ defaultValues: { count: 1, terms: false } });
  let form!: ReturnType<typeof useSettingsForm>;
  const seen: number[] = [];
  function App() {
    const api = useSettingsForm();
    useEffect(() => {
      form = api;
    });
    return (
      <div>
        <api.AppField name="count">
          {(field) => (
            <field.Field>
              <Field.Label>Count</Field.Label>
              <Stepper onValueChange={(next) => seen.push(next)} />
            </field.Field>
          )}
        </api.AppField>
        <api.AppField name="terms">
          {(field) => (
            <field.Field controlMode="checked">
              <Field.Label>Terms</Field.Label>
              <Checkbox />
            </field.Field>
          )}
        </api.AppField>
      </div>
    );
  }
  const screen = await render(<App />);
  const stepper = screen.getByRole('button', { name: 'Count' });
  await userEvent.click(stepper);
  expect(form.state.values.count).toBe(2);
  await expect.element(stepper).toHaveTextContent('2');
  expect(seen).toEqual([2]);
  const box = screen.getByRole('checkbox', { name: 'Terms' });
  await userEvent.click(box);
  expect(form.state.values.terms).toBe(true);
  await expect.element(box).toBeChecked();
  form.setFieldValue('terms', false);
  await expect.element(box).not.toBeChecked();
});

test('a native input reports its value, not its event', async () => {
  const useNicknameForm = () => useForm({ defaultValues: { nickname: 'ids' } });
  let form!: ReturnType<typeof useNicknameForm>;
  function App() {
    const api = useNicknameForm();
    useEffect(() => {
      form = api;
    });
    return (
      <api.Field name="nickname">
        {(field) => (
          <Field field={field}>
            <Field.Label>Nickname</Field.Label>
            <input />
          </Field>
        )}
      </api.Field>
    );
  }
  const screen = await render(<App />);
  const input = screen.getByRole('textbox', { name: 'Nickname' });
  await expect.element(input).toHaveValue('ids');
  await userEvent.fill(input, 'infoteam');
  expect(form.state.values.nickname).toBe('infoteam');
});

test('without a field it renders a plain Field and warns in development', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const screen = await render(
      <Field>
        <Field.Label>Name</Field.Label>
        <TextField />
      </Field>,
    );
    await expect.element(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('TanStack Form'));
  } finally {
    warn.mockRestore();
  }
});
