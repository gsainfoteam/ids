import { useEffect, useState } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, Input, NumberField } from '../src';
import { Field as RhfField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

test('SSR dispatch preserves native types, Field labels, sizes, invalid state and number semantics', () => {
  for (const type of ['text', 'email', 'url', 'search', 'number', 'password', 'tel'] as const) {
    const doc = parse(
      renderToString(
        <Field invalid required size="tiny">
          <Field.Label>{type}</Field.Label>
          <Input type={type} name={type} />
          <Field.Error>Required</Field.Error>
        </Field>,
      ),
    );
    const node = doc.querySelector<HTMLInputElement>('input:not([type=hidden])')!;
    expect(node.type).toBe(type === 'number' ? 'text' : type);
    expect(doc.querySelector('label')!.htmlFor).toBe(node.id);
    expect(node.getAttribute('aria-invalid')).toBe('true');
    expect(node.required).toBe(true);
    expect(doc.getElementById(node.getAttribute('aria-describedby')!)!.textContent).toBe(
      'Required',
    );
    if (type === 'number') expect(node.getAttribute('role')).toBe('spinbutton');
  }
});

test('uncontrolled search clear emits one native change, retains focus and supports form reset', async () => {
  const values: Array<[string, string, string]> = [];
  let ref: HTMLInputElement | null = null;
  const screen = await render(
    <form>
      <Input
        type="search"
        name="q"
        defaultValue="IDS"
        ref={(node) => {
          ref = node;
        }}
        onChange={(event) => values.push([event.target.value, event.target.name, event.type])}
      />
      <button type="reset">Reset</button>
    </form>,
  );
  const search = screen.getByRole('searchbox');
  expect(ref).toBe(search.element());
  await userEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));
  await expect.element(search).toHaveValue('');
  expect(values).toEqual([['', 'q', 'change']]);
  await expect.element(search).toHaveFocus();
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(search).toHaveValue('IDS');
  await userEvent.fill(search, 'again');
  await expect.element(search).toHaveValue('again');
});

test('controlled search clear respects owner state, then accepts external updates', async () => {
  let update!: (value: string) => void;
  const values: string[] = [];
  function Demo() {
    const [value, setValue] = useState('first');
    useEffect(() => {
      update = setValue;
    }, []);
    return (
      <Input
        type="search"
        value={value}
        onChange={(event) => {
          values.push(event.target.value);
          setValue(event.target.value);
        }}
      />
    );
  }
  const screen = await render(<Demo />);
  const search = screen.getByRole('searchbox');
  await userEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));
  expect(values).toEqual(['']);
  await expect.element(search).toHaveValue('');
  update('external');
  await expect.element(search).toHaveValue('external');
});

test('search readonly/disabled have nothing to clear; native input ref cleans up', async () => {
  const cleanup = vi.fn();
  const screen = await render(
    <Input key="readOnly" type="search" defaultValue="keep" readOnly ref={() => cleanup} />,
  );
  await expect.element(screen.getByRole('button')).not.toBeInTheDocument();
  await expect.element(screen.getByRole('searchbox')).toHaveValue('keep');
  await screen.rerender(
    <Input key="disabled" type="search" defaultValue="keep" disabled ref={() => cleanup} />,
  );
  await expect.element(screen.getByRole('button')).not.toBeInTheDocument();
  await expect.element(screen.getByRole('searchbox')).toHaveValue('keep');
  await screen.rerender(null);
  expect(cleanup).toHaveBeenCalled();
});

test('search shows a search icon and a Clear only while filled; address types stay literal', async () => {
  const escapes: boolean[] = [];
  const recordEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') escapes.push(event.defaultPrevented);
  };
  document.addEventListener('keydown', recordEscape);
  try {
    const screen = await render(<Input type="search" aria-label="Find" />);
    const search = screen.getByRole('searchbox', { name: 'Find' });
    await expect.element(search).toHaveAttribute('enterkeyhint', 'search');
    expect(screen.container.querySelector('[data-text-field-adornment] svg')).not.toBeNull();
    await expect.element(screen.getByRole('button')).not.toBeInTheDocument();
    await userEvent.fill(search, 'ids');
    await expect.element(screen.getByRole('button')).toHaveAttribute('aria-label', '검색어 지우기');
    await userEvent.keyboard('{Escape}');
    expect(escapes).toEqual([true]);
    await expect.element(search).toHaveValue('');
    for (const type of ['email', 'url'] as const) {
      await screen.rerender(<Input key={type} type={type} aria-label={type} />);
      const address = screen.getByRole('textbox', { name: type });
      await expect.element(address).toHaveAttribute('autocapitalize', 'none');
      await expect.element(address).toHaveAttribute('autocorrect', 'off');
      await expect.element(address).toHaveAttribute('spellcheck', 'false');
    }
    await screen.rerender(<Input key="text" type="text" aria-label="text" />);
    await expect
      .element(screen.getByRole('textbox', { name: 'text' }))
      .not.toHaveAttribute('autocapitalize');
  } finally {
    document.removeEventListener('keydown', recordEscape);
  }
});

test('number compound children and numeric callback pass through Input', async () => {
  const values: Array<number | null> = [];
  const screen = await render(
    <Input
      type="number"
      defaultValue={2}
      min={0}
      step={0.5}
      onValueChange={(value) => values.push(value)}
    >
      <NumberField.Input />
      <NumberField.Clear />
      <NumberField.Stepper />
    </Input>,
  );
  await userEvent.click(screen.getByRole('button', { name: '값 늘리기' }));
  expect(values).toEqual([2.5]);
  await userEvent.click(screen.getByRole('button', { name: '지우기' }));
  expect(values.at(-1)).toBeNull();
});

test('RHF native search and controlled number/tel retain value types, clear, reset and error focus', async () => {
  let methods!: UseFormReturn<{ query: string; count: number; phone: string }>;
  function Form() {
    const form = useForm({ defaultValues: { query: 'default', count: 2, phone: '' } });
    useEffect(() => {
      methods = form;
    });
    return (
      <FormProvider {...form}>
        <form>
          <RhfField name="query">
            <RhfField.Label>Search</RhfField.Label>
            <Input type="search" />
          </RhfField>
          <RhfField name="count" controlMode="value" aria-label="Count">
            <Input type="number" />
          </RhfField>
          <RhfField name="phone" controlMode="value" aria-label="Phone">
            <Input type="tel" format="none" />
          </RhfField>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<Form />);
  const search = screen.getByRole('searchbox', { name: 'Search' });
  const count = screen.getByRole('spinbutton', { name: 'Count' });
  const phone = screen.getByRole('textbox', { name: 'Phone' });
  await userEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));
  expect(methods.getValues('query')).toBe('');
  await userEvent.fill(count, '3');
  await userEvent.fill(phone, '01012345678');
  expect(methods.getValues('count')).toBe(3);
  expect(typeof methods.getValues('phone')).toBe('string');
  methods.reset({ query: 'reset', count: 5, phone: '123' });
  await expect.element(search).toHaveValue('reset');
  await expect.element(count).toHaveValue('5');
  methods.setError('count', { message: 'Invalid' }, { shouldFocus: true });
  await expect.element(count).toHaveFocus();
});

test('unsupported runtime type falls back to text; explicit aria-invalid wins', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const screen = await render(
      // @ts-expect-error Dates use the dedicated DateField, so the type is rejected at compile time.
      <Input type="date" invalid aria-invalid={false} />,
    );
    const input = screen.getByRole('textbox');
    await expect.element(input).toHaveAttribute('type', 'text');
    await expect.element(input).toHaveAttribute('aria-invalid', 'false');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unsupported type "date"'));
  } finally {
    warn.mockRestore();
  }
});
