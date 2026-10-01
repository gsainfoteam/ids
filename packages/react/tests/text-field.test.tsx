import { useEffect, useState } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, TextField } from '../src';
import { Field as RhfField } from '../src/react-hook-form';

test('Input values win over root values, but root and Input handlers both run', async () => {
  const changes: string[] = [];
  const screen = await render(
    <TextField id="root-id" name="root" onChange={() => changes.push('root')}>
      <TextField.Input name="input" onChange={() => changes.push('input')} />
    </TextField>,
  );
  const input = screen.getByRole('textbox');
  await expect.element(input).toHaveAttribute('id', 'root-id');
  await expect.element(input).toHaveAttribute('name', 'input');
  await userEvent.fill(input, 'a');
  expect(changes).toEqual(['root', 'input']);
});

test('sentinel inside a Fragment splits leading and trailing adornments', async () => {
  const screen = await render(
    <TextField aria-label="Search">
      <>
        <span>Lead</span>
        <TextField.Input />
        <span>Trail</span>
      </>
    </TextField>,
  );
  const shell = screen.container.querySelector<HTMLElement>('[data-text-field]')!;
  expect(
    Array.from(shell.children, (element) =>
      element instanceof HTMLElement && 'textFieldAdornment' in element.dataset
        ? element.textContent
        : element.tagName,
    ),
  ).toEqual(['Lead', 'INPUT', 'Trail']);
});

test('asChild merges props and ref into the child input', async () => {
  let node: HTMLInputElement | null = null;
  const changes: string[] = [];
  const screen = await render(
    <TextField
      name="q"
      onChange={() => changes.push('root')}
      ref={(value) => {
        node = value;
      }}
    >
      <TextField.Input asChild>
        <input spellCheck={false} onChange={() => changes.push('child')} />
      </TextField.Input>
    </TextField>,
  );
  const input = screen.getByRole('textbox');
  expect(node).toBe(input.element());
  await expect.element(input).toHaveAttribute('name', 'q');
  await expect.element(input).toHaveAttribute('spellcheck', 'false');
  await expect.element(input).toHaveAttribute('data-text-field-input');
  await userEvent.fill(input, 'a');
  expect(changes).toEqual(['child', 'root']);
});

test('invalid structures fail clearly', () => {
  for (const node of [
    <TextField>
      <TextField.Input />
      <TextField.Input />
    </TextField>,
    <TextField>
      <TextField.Input asChild>
        <textarea />
      </TextField.Input>
    </TextField>,
    <TextField>
      <TextField.Input>text</TextField.Input>
    </TextField>,
  ])
    expect(() => renderToString(node)).toThrow(/\[IDS\] `<TextField/);
});

test('the shell carries the input state; the input is marked for focus-ring', async () => {
  const screen = await render(<TextField aria-label="Name" invalid />);
  const input = screen.getByRole('textbox', { name: 'Name' });
  const shell = () => screen.container.querySelector<HTMLElement>('[data-text-field]')!;
  await expect.element(input).toHaveAttribute('data-field-input');
  await expect.element(shell()).toHaveAttribute('data-invalid');
  await expect.element(input).toHaveAttribute('aria-invalid', 'true');
  await screen.rerender(
    <Field invalid aria-label="Name">
      <TextField />
    </Field>,
  );
  await expect.element(shell()).toHaveAttribute('data-invalid');
  await screen.rerender(<TextField aria-label="Name" readOnly defaultValue="x" />);
  await expect.element(shell()).toHaveAttribute('data-readonly');
  await expect.element(shell()).toHaveAttribute('data-filled');
  await userEvent.click(input);
  await expect.element(shell()).toHaveAttribute('data-focused');
  input.element().blur();
  await expect.element(shell()).not.toHaveAttribute('data-focused');
});

test('onValueChange reports the string next to the native onChange event', async () => {
  const events: Array<[string, string]> = [];
  const screen = await render(
    <TextField
      aria-label="Name"
      onChange={(event) => events.push(['change', event.target.value])}
      onValueChange={(value) => events.push(['value', value])}
    />,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  await userEvent.fill(input, 'ab');
  expect(events).toEqual([
    ['change', 'ab'],
    ['value', 'ab'],
  ]);
  let setOuter!: (value: string) => void;
  const calls: string[] = [];
  function Controlled() {
    const [value, setValue] = useState('first');
    useEffect(() => {
      setOuter = setValue;
    }, []);
    return <TextField aria-label="Name" value={value} onValueChange={(next) => calls.push(next)} />;
  }
  await screen.rerender(<Controlled key="controlled" />);
  setOuter('from parent');
  await expect.element(input).toHaveValue('from parent');
  expect(calls).toEqual([]);
});

test('Clear shows only while filled, clears through a real input event and keeps focus', async () => {
  const values: string[] = [];
  const screen = await render(
    <TextField aria-label="Search" onValueChange={(value) => values.push(value)}>
      <TextField.Input />
      <TextField.Clear />
    </TextField>,
  );
  const input = screen.getByRole('textbox', { name: 'Search' });
  const clear = screen.getByRole('button', { name: '지우기' });
  const shell = () => screen.container.querySelector<HTMLElement>('[data-text-field]')!;
  await expect.element(clear).not.toBeInTheDocument();
  await userEvent.fill(input, 'ids');
  await expect.element(shell()).toHaveAttribute('data-filled');
  await expect.element(clear).toHaveAttribute('aria-label', '지우기');
  await expect.element(clear).toHaveAttribute('tabindex', '-1');
  await expect.element(clear).toHaveAttribute('aria-controls', input.element().id);
  await userEvent.click(clear);
  await expect.element(input).toHaveValue('');
  expect(values).toEqual(['ids', '']);
  await expect.element(input).toHaveFocus();
  await expect.element(clear).not.toBeInTheDocument();
  await screen.rerender(
    <TextField key="read-only" aria-label="Search" defaultValue="keep" readOnly>
      <TextField.Input />
      <TextField.Clear />
    </TextField>,
  );
  await expect.element(shell()).toHaveAttribute('data-filled');
  await expect.element(clear).not.toBeInTheDocument();
});

test('Escape clears a clearable field and lets the key through once it is empty', async () => {
  const escapes: boolean[] = [];
  const recordEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') escapes.push(event.defaultPrevented);
  };
  document.addEventListener('keydown', recordEscape);
  try {
    const screen = await render(
      <TextField aria-label="Search" defaultValue="ids">
        <TextField.Input />
        <TextField.Clear />
      </TextField>,
    );
    const input = screen.getByRole('textbox', { name: 'Search' });
    await userEvent.click(input);
    await userEvent.keyboard('{Escape}');
    expect(escapes).toEqual([true]);
    await expect.element(input).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    expect(escapes).toEqual([true, false]);
    await screen.rerender(<TextField key="plain" aria-label="Plain" defaultValue="ids" />);
    const plain = screen.getByRole('textbox', { name: 'Plain' });
    await userEvent.click(plain);
    await userEvent.keyboard('{Escape}');
    expect(escapes).toEqual([true, false, false]);
    await expect.element(plain).toHaveValue('ids');
  } finally {
    document.removeEventListener('keydown', recordEscape);
  }
});

test('a direct write to input.value (react-hook-form setValue) shows Clear and fills the Field', async () => {
  let methods!: UseFormReturn<{ query: string }>;
  function App() {
    const form = useForm({ defaultValues: { query: '' } });
    useEffect(() => {
      methods = form;
    });
    return (
      <FormProvider {...form}>
        <RhfField name="query" aria-label="Query">
          <TextField>
            <TextField.Input />
            <TextField.Clear />
          </TextField>
        </RhfField>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const input = screen.getByRole('textbox', { name: 'Query' });
  const clear = screen.getByRole('button', { name: '지우기' });
  await expect.element(clear).not.toBeInTheDocument();
  methods.setValue('query', 'from code');
  await expect.element(input).toHaveValue('from code');
  await expect.element(clear).toBeInTheDocument();
  await expect
    .element(input.element().closest<HTMLElement>('[data-field]'))
    .toHaveAttribute('data-filled');
  await userEvent.click(clear);
  expect(methods.getValues('query')).toBe('');
});

test('native form reset hides Clear again', async () => {
  const screen = await render(
    <form>
      <TextField aria-label="Search" name="q">
        <TextField.Input />
        <TextField.Clear />
      </TextField>
      <button type="reset">Reset</button>
    </form>,
  );
  const input = screen.getByRole('textbox', { name: 'Search' });
  const clear = screen.getByRole('button', { name: '지우기' });
  await userEvent.fill(input, 'typed');
  await expect.element(clear).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(input).toHaveValue('');
  await expect.element(clear).not.toBeInTheDocument();
});

test('pressing the shell padding focuses the input; buttons keep their own presses', async () => {
  const presses: boolean[] = [];
  const recordPress = (event: MouseEvent) => presses.push(event.defaultPrevented);
  document.addEventListener('mousedown', recordPress);
  try {
    const screen = await render(
      <TextField aria-label="Search">
        <span>Lead</span>
        <TextField.Input />
        <button type="button">Act</button>
      </TextField>,
    );
    const input = screen.getByRole('textbox', { name: 'Search' });
    await userEvent.click(screen.getByText('Lead'));
    expect(presses).toEqual([true]);
    await expect.element(input).toHaveFocus();
    input.element().blur();
    await userEvent.click(screen.getByRole('button', { name: 'Act' }));
    expect(presses).toEqual([true, false]);
    await expect.element(input).not.toHaveFocus();
  } finally {
    document.removeEventListener('mousedown', recordPress);
  }
});

test('className and style accept a function of the field state', async () => {
  const screen = await render(
    <TextField
      aria-label="Name"
      className={(state) => (state.filled ? 'has-value' : 'empty')}
      style={(state) => ({ opacity: state.focused ? 1 : 0.5 })}
    />,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  const shell = screen.container.querySelector<HTMLElement>('[data-text-field]')!;
  await expect.element(shell).toHaveClass('empty');
  await expect.element(shell).toHaveStyle({ opacity: '0.5' });
  await userEvent.click(input);
  await userEvent.fill(input, 'a');
  await expect.element(shell).toHaveClass('has-value');
  await expect.element(shell).toHaveStyle({ opacity: '1' });
});

test('a ref callback is attached once, not again on every keystroke', async () => {
  const attached = vi.fn();
  const detached = vi.fn();
  const screen = await render(
    <TextField
      aria-label="Name"
      ref={(node) => {
        if (!node) return;
        attached();
        return detached;
      }}
    >
      <TextField.Input />
      <TextField.Clear />
    </TextField>,
  );
  await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'ab');
  expect(attached).toHaveBeenCalledOnce();
  expect(detached).not.toHaveBeenCalled();
});
