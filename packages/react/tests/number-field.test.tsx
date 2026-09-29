import { useLayoutEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { cdp, userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { z } from 'zod';

import { Field, NumberField } from '../src';
import { Field as FormField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const resetSettles = () => new Promise((resolve) => setTimeout(resolve));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function controlled(props: NumberField.Props = {}) {
  const changes: Array<number | null> = [];
  const latest = { value: props.defaultValue ?? null, set: (_next: number | null) => {} };
  function Controlled() {
    const [value, setValue] = useState(latest.value);
    useLayoutEffect(() => {
      latest.value = value;
      latest.set = setValue;
    }, [value]);
    const inlineObjectEachRender = props.formatOptions ? { ...props.formatOptions } : undefined;
    return (
      <NumberField
        {...props}
        value={value}
        onValueChange={(next) => {
          changes.push(next);
          setValue(next);
        }}
        formatOptions={inlineObjectEachRender}
      />
    );
  }
  return {
    node: <Controlled />,
    value: () => latest.value,
    set: (next: number | null) => latest.set(next),
    changes,
  };
}

function node(input: Locator) {
  return input.element() as HTMLInputElement;
}

function shellOf(input: Locator) {
  return node(input).closest<HTMLElement>('[data-number-field]')!;
}

async function keyWasPrevented(keys: string, key: string) {
  let prevented: boolean | undefined;
  const record = (event: KeyboardEvent) => {
    if (event.key === key) prevented = event.defaultPrevented;
  };
  window.addEventListener('keydown', record);
  await userEvent.keyboard(keys);
  window.removeEventListener('keydown', record);
  return prevented;
}

async function wheelWasPrevented(target: Locator, deltaY: number) {
  const reached = new Promise<boolean>((resolve) =>
    window.addEventListener('wheel', (event) => resolve(event.defaultPrevented), {
      once: true,
      passive: true,
    }),
  );
  await userEvent.wheel(target, { delta: { y: deltaY } });
  return reached;
}

async function copy(text: string) {
  const scratch = document.createElement('input');
  document.body.append(scratch);
  scratch.value = text;
  scratch.focus();
  scratch.select();
  await userEvent.copy();
  scratch.remove();
}

function touchPointOn(target: Locator) {
  const frame = window.frameElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const rect = target.element().getBoundingClientRect();
  return { x: frame.left + rect.left + rect.width / 2, y: frame.top + rect.top + rect.height / 2 };
}

test('SSR Field wiring, formatted ARIA, and canonical native FormData', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field required invalid size="tiny">
          <Field.Label>Price</Field.Label>
          <NumberField
            name="price"
            defaultValue={1234.5}
            min={0}
            max={2000}
            formatOptions={{ style: 'currency', currency: 'USD' }}
          />
          <Field.Error>Check price</Field.Error>
        </Field>
      </form>,
    ),
  );
  const input = doc.querySelector<HTMLInputElement>('[role=spinbutton]')!;
  expect(input.type).toBe('text');
  expect(input.value).toBe('$1,234.50');
  expect(input.getAttribute('aria-valuenow')).toBe('1234.5');
  expect(input.getAttribute('aria-valuemin')).toBe('0');
  expect(input.getAttribute('aria-valuemax')).toBe('2000');
  expect(input.getAttribute('aria-valuetext')).toBe('$1,234.50');
  expect(doc.querySelector<HTMLElement>('[data-number-field]')!.dataset.size).toBe('tiny');
  expect(doc.querySelector('label')!.htmlFor).toBe(input.id);
  expect(doc.getElementById(input.getAttribute('aria-describedby')!)!.textContent).toBe(
    'Check price',
  );
  expect(input.required).toBe(true);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  const data = new FormData(doc.querySelector('form')!);
  expect(data.get('price')).toBe('1234.5');
  expect(data.getAll('price')).toHaveLength(1);
});

test('controlled partial drafts, negative/decimal values, zero, null and external updates', async () => {
  const form = controlled({ defaultValue: 1, formatOptions: { useGrouping: true } });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  await userEvent.fill(input, '-');
  await expect.element(input).toHaveValue('-');
  expect(form.value()).toBe(null);
  await userEvent.fill(input, '-0.');
  await expect.element(input).toHaveValue('-0.');
  expect(form.value()).toBe(0);
  await userEvent.fill(input, '-0.25');
  expect(form.value()).toBe(-0.25);
  await userEvent.fill(input, '1.');
  await expect.element(input).toHaveValue('1.');
  await userEvent.fill(input, '1.20');
  await expect.element(input).toHaveValue('1.20');
  expect(form.value()).toBe(1.2);
  node(input).blur();
  await expect.element(input).toHaveValue('1.2');
  form.set(1234.5);
  await expect.element(input).toHaveValue('1,234.5');
  node(input).focus();
  await expect
    .element(input, { message: 'the formatted text is edited in place' })
    .toHaveValue('1,234.5');
  await userEvent.fill(input, '1,234.56');
  expect(form.value()).toBe(1234.56);
  await userEvent.clear(input);
  expect(form.value()).toBe(null);
  await expect.element(input).not.toHaveAttribute('aria-valuenow');
  await userEvent.fill(input, '.');
  node(input).blur();
  await expect.element(input).toHaveValue('');
  expect(form.changes.every((value) => value === null || Number.isFinite(value))).toBe(true);
});

test('currency, locale decimal/grouping, percent typing and display-only precision', async () => {
  const euro = controlled({
    defaultValue: 1234.567,
    formatOptions: { style: 'currency', currency: 'EUR' },
    locale: 'de-DE',
  });
  const screen = await render(euro.node);
  const input = screen.getByRole('spinbutton');
  await expect.element(input).toHaveValue('1.234,57 €');
  node(input).focus();
  await expect.element(input).toHaveValue('1.234,57 €');
  await userEvent.fill(input, '2.345,67 €');
  expect(euro.value()).toBe(2345.67);
  await expect.element(input).toHaveValue('2.345,67 €');
  await userEvent.fill(input, '2.345,678');
  node(input).blur();
  await expect.element(input).toHaveValue('2.345,68 €');
  expect(euro.value(), 'rounding is for display only').toBe(2345.678);
  await screen.unmount();

  const percent = controlled({
    defaultValue: 0.125,
    min: 0,
    max: 1,
    step: 0.01,
    formatOptions: { style: 'percent', minimumFractionDigits: 1 },
  });
  const next = await render(percent.node);
  const field = next.getByRole('spinbutton');
  await expect.element(field).toHaveValue('12.5%');
  node(field).focus();
  await expect.element(field).toHaveValue('12.5%');
  await userEvent.fill(field, '25');
  expect(percent.value(), 'a percent field is typed in percent').toBe(0.25);
  await userEvent.fill(field, '%');
  expect(percent.value(), 'a sign without digits is no value yet').toBe(null);
  await userEvent.fill(field, '25%');
  expect(percent.value()).toBe(0.25);
  node(field).blur();
  await expect.element(field).toHaveValue('25.0%');
});

test('localized digits and accounting parentheses parse; text that is no number is refused', async () => {
  const arabic = controlled({ locale: 'ar-EG' });
  const screen = await render(arabic.node);
  const input = screen.getByRole('spinbutton');
  await userEvent.fill(input, '١٬٢٣٤٫٥');
  expect(arabic.value()).toBe(1234.5);
  for (const text of ['1e3', '1K', '--12', 'abc']) {
    await userEvent.fill(input, text);
    expect(arabic.value(), `${text} is refused`).toBe(1234.5);
    await expect
      .element(input, { message: `${text} leaves the text as it was` })
      .toHaveValue('١٬٢٣٤٫٥');
  }
  await userEvent.fill(input, '１２');
  expect(arabic.value()).toBe(12);
  await screen.unmount();

  const accounting = controlled({
    formatOptions: { style: 'currency', currency: 'USD', currencySign: 'accounting' },
  });
  const next = await render(accounting.node);
  const field = next.getByRole('spinbutton');
  await userEvent.fill(field, '(');
  await expect.element(field).toHaveValue('(');
  expect(accounting.value()).toBe(null);
  await userEvent.fill(field, '(123.5)');
  expect(accounting.value()).toBe(-123.5);
  node(field).blur();
  await expect.element(field).toHaveValue('($123.50)');
});

test('edits that cannot become a number are refused before they land', async () => {
  const form = controlled({ defaultValue: 12, min: 0 });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  node(input).focus();
  node(input).setSelectionRange(1, 1);
  await userEvent.keyboard('x');
  await expect.element(input).toHaveValue('12');
  expect(node(input).selectionStart, 'the caret stays where it was').toBe(1);
  await userEvent.keyboard('3');
  await expect.element(input).toHaveValue('132');
  node(input).setSelectionRange(0, 0);
  await userEvent.keyboard('-');
  await expect.element(input, { message: 'min 0 refuses a minus sign' }).toHaveValue('132');
  expect(node(input).selectionStart).toBe(0);

  await copy('abc');
  node(input).focus();
  node(input).setSelectionRange(0, 0);
  await userEvent.paste();
  await expect.element(input).toHaveValue('132');
  await copy(' 1,000 ');
  node(input).focus();
  node(input).setSelectionRange(0, 0);
  await userEvent.paste();
  await expect.element(input).toHaveValue(' 1,000 132');
  expect(form.value()).toBe(1000132);

  node(input).select();
  await userEvent.keyboard('{Backspace}');
  await expect.element(input).toHaveValue('');
  await userEvent.keyboard('{ControlOrMeta>}z{/ControlOrMeta}');
  await expect.element(input).toHaveValue(' 1,000 132');

  const end = node(input).value.length;
  node(input).setSelectionRange(end, end);
  await cdp().send('Input.imeSetComposition', { text: 'x', selectionStart: 1, selectionEnd: 1 });
  await expect
    .element(input, { message: 'a composition is judged when it ends' })
    .toHaveValue(' 1,000 132x');
  await cdp().send('Input.insertText', { text: 'x' });
  await expect.element(input).toHaveValue('1,000,132');
  expect(form.value()).toBe(1000132);

  await screen.rerender(<NumberField key="signed" defaultValue={12} />);
  node(input).focus();
  node(input).setSelectionRange(0, 0);
  await userEvent.keyboard('-');
  await expect.element(input).toHaveValue('-12');
});

test('min/max commit on blur/Enter, decimal/large steps, empty start and endpoint disabling', async () => {
  const form = controlled({ min: -1, max: 1, step: 0.1, largeStep: 0.5, defaultValue: 0.1 });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  node(input).focus();
  await userEvent.keyboard('{ArrowUp}');
  expect(form.value()).toBe(0.2);
  await userEvent.keyboard('{ArrowUp}');
  expect(form.value()).toBe(0.3);
  await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
  expect(form.value()).toBe(0.8);
  await userEvent.keyboard('{PageUp}');
  expect(form.value()).toBe(1);
  await expect.element(screen.getByRole('button', { name: '값 늘리기' })).toBeDisabled();
  await userEvent.keyboard('{ArrowDown}');
  expect(form.value()).toBe(0.9);
  await userEvent.fill(input, '-20');
  expect(form.value()).toBe(-20);
  node(input).blur();
  await expect.poll(() => form.value()).toBe(-1);
  await expect.element(screen.getByRole('button', { name: '값 줄이기' })).toBeDisabled();
  await userEvent.fill(input, '20');
  await userEvent.keyboard('{Enter}');
  expect(form.value()).toBe(1);
  await userEvent.clear(input);
  await userEvent.keyboard('{ArrowUp}');
  expect(form.value()).toBe(0.1);
  await screen.unmount();

  const positive = controlled({ min: 5, max: 10 });
  const next = await render(positive.node);
  node(next.getByRole('spinbutton')).focus();
  await userEvent.keyboard('{ArrowUp}');
  expect(positive.value()).toBe(5);
});

test('default large step and very small decimal arithmetic keep exact values', async () => {
  const form = controlled({ defaultValue: 0.0000001, step: 0.0000001 });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  node(input).focus();
  await expect.element(input).toHaveValue('0.0000001');
  await userEvent.keyboard('{ArrowUp}');
  expect(form.value()).toBe(0.0000002);
  await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
  expect(form.value()).toBe(0.0000012);
  node(input).blur();
  await expect.element(input).toHaveValue('0.0000012');
});

test('default largeStep scales decimal 0.07 exactly, and tiny values remain visible', async () => {
  const form = controlled({ defaultValue: 0, step: 0.07 });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  node(input).focus();
  await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
  expect(form.value()).toBe(0.7);
  form.set(1e-25);
  node(input).blur();
  await expect.element(input).toHaveValue('0.0000000000000000000000001');
});

test('sentinel/asChild forwards refs and events, explicit Stepper is not duplicated, Clear null/override', async () => {
  let seen: HTMLInputElement | null = null;
  let cleanups = 0;
  const events: string[] = [];
  const form = controlled({
    defaultValue: 10,
    ref: (element: HTMLInputElement | null) => {
      seen = element;
      return () => {
        cleanups++;
      };
    },
    onFocus: () => events.push('root-focus'),
    children: (
      <>
        <span>$</span>
        <NumberField.Input asChild onFocus={() => events.push('input-focus')}>
          <input onFocus={() => events.push('child-focus')} />
        </NumberField.Input>
        <NumberField.Clear asChild>
          <button>Clear</button>
        </NumberField.Clear>
        <NumberField.Stepper asChild>
          <span data-testid="custom-stepper" />
        </NumberField.Stepper>
      </>
    ),
  });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  expect(seen).toBe(input.element());
  expect(screen.container.querySelectorAll('[data-number-field-stepper]')).toHaveLength(1);
  node(input).focus();
  expect(events).toEqual(['child-focus', 'root-focus', 'input-focus']);
  await userEvent.click(screen.getByRole('button', { name: '값 늘리기' }));
  expect(form.value()).toBe(11);
  await expect.element(input).toHaveFocus();
  await userEvent.click(screen.getByRole('button', { name: '지우기' }));
  expect(form.value()).toBe(null);
  await expect.element(screen.getByRole('button', { name: '지우기' })).not.toBeInTheDocument();
  await expect.element(input).toHaveFocus();
  await screen.unmount();
  expect(cleanups).toBeGreaterThan(0);

  let clears = 0;
  const next = await render(
    <NumberField defaultValue={5}>
      <NumberField.Input />
      <NumberField.Clear
        onClick={(event) => {
          clears++;
          event.preventDefault();
        }}
      />
    </NumberField>,
  );
  await userEvent.click(next.getByRole('button', { name: '지우기' }));
  expect(clears).toBe(1);
  await expect
    .element(next.getByRole('spinbutton'), { message: 'preventDefault keeps the value' })
    .toHaveValue('5');
});

test('readOnly/disabled, custom key cancellation, wheel and native editing shortcuts', async () => {
  const changes: Array<number | null> = [];
  const screen = await render(
    <Field disabled invalid={false}>
      <Field.Label>Amount</Field.Label>
      <NumberField defaultValue={5} invalid onValueChange={(value) => changes.push(value)} />
    </Field>,
  );
  const input = screen.getByRole('spinbutton');
  await expect.element(input).toBeDisabled();
  await expect.element(input).toHaveAttribute('aria-invalid', 'false');
  node(input).focus();
  await userEvent.keyboard('{ArrowUp}');
  await userEvent.click(screen.getByRole('button', { name: '값 늘리기' }), { force: true });
  expect(changes).toEqual([]);

  await screen.rerender(<NumberField defaultValue={5} readOnly />);
  await expect.element(screen.getByRole('button', { name: '값 늘리기' })).toBeDisabled();
  node(input).focus();
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(input).toHaveValue('5');

  await screen.rerender(
    <NumberField
      defaultValue={5}
      onKeyDown={(event) => {
        if (event.key === 'ArrowUp') event.preventDefault();
      }}
    />,
  );
  node(input).focus();
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(input).toHaveValue('5');
  await userEvent.keyboard('a');
  await expect.element(input).toHaveValue('5');
  expect(await keyWasPrevented('{ControlOrMeta>}a{/ControlOrMeta}', 'a')).toBe(false);
  expect(await keyWasPrevented('{Home}', 'Home')).toBe(false);
  await userEvent.keyboard('{Meta>}{ArrowDown}{/Meta}');
  await expect.element(input).toHaveValue('5');
  await userEvent.wheel(input, { delta: { y: -100 } });
  await expect.element(input).toHaveValue('5');
  await expect.element(input).toHaveFocus();
});

test('IME composition defers conversion and stepping until composition ends', async () => {
  const form = controlled({ defaultValue: 1 });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  node(input).focus();
  node(input).select();
  await cdp().send('Input.imeSetComposition', {
    text: '１２',
    selectionStart: 2,
    selectionEnd: 2,
  });
  await expect.element(input).toHaveValue('１２');
  expect(form.value()).toBe(1);
  await userEvent.keyboard('{ArrowUp}');
  expect(form.value()).toBe(1);
  await cdp().send('Input.insertText', { text: '１２' });
  await expect.element(input).toHaveValue('12');
  expect(form.value()).toBe(12);
});

test('native reset restores uncontrolled value and FormData, canceled reset preserves edits', async () => {
  const screen = await render(
    <form aria-label="Order">
      <NumberField name="quantity" defaultValue={5} />
      <button type="reset">Reset</button>
    </form>,
  );
  const form = screen.getByRole('form');
  const input = screen.getByRole('spinbutton');
  const reset = screen.getByRole('button', { name: 'Reset' });
  await userEvent.fill(input, '8');
  await expect.element(form).toHaveFormValues({ quantity: '8' });
  await userEvent.click(reset);
  await expect.element(input).toHaveValue('5');
  await expect.element(form).toHaveFormValues({ quantity: '5' });
  await userEvent.fill(input, '9');
  form.element().addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await userEvent.click(reset);
  await resetSettles();
  await expect.element(input).toHaveValue('9');
});

test('Zod + RHF value adapter: number/null validation, focus, numeric submit, setValue/reset and disabled omission', async () => {
  const schema = z.object({
    quantity: z
      .number()
      .nullable()
      .refine((value) => value != null, 'Required quantity'),
  });
  type Input = z.input<typeof schema>;
  type Output = z.output<typeof schema>;
  const handle: { methods?: UseFormReturn<Input, unknown, Output> } = {};
  let result: Partial<Output> | undefined;
  function App({ disabled = false }: { disabled?: boolean }) {
    const methods = useForm<Input, unknown, Output>({
      resolver: zodResolver(schema),
      defaultValues: { quantity: null },
    });
    useLayoutEffect(() => {
      handle.methods = methods;
    }, [methods]);
    return (
      <FormProvider {...methods}>
        <form
          noValidate
          onSubmit={methods.handleSubmit((value) => {
            result = value;
          })}
        >
          <FormField name="quantity" controlMode="value" disabled={disabled}>
            <FormField.Label>Quantity</FormField.Label>
            <NumberField min={1} max={99} />
            <FormField.Error />
          </FormField>
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const input = screen.getByRole('spinbutton', { name: 'Quantity' });
  const submit = screen.getByRole('button', { name: 'Submit' });
  const methods = () => handle.methods!;
  await userEvent.click(submit);
  await expect
    .poll(() => screen.container.querySelector('[data-field-part=error]')?.textContent)
    .toBe('Required quantity');
  await expect.element(input).toHaveFocus();
  await userEvent.fill(input, '12');
  expect(methods().getValues('quantity')).toBe(12);
  await userEvent.click(submit);
  await expect.poll(() => result).toEqual({ quantity: 12 });
  expect(typeof result?.quantity).toBe('number');
  methods().setValue('quantity', 7);
  await expect.element(input).toHaveValue('7');
  methods().reset();
  await expect.element(input).toHaveValue('');
  expect(methods().getValues('quantity')).toBe(null);
  methods().setValue('quantity', 7);
  await screen.rerender(<App disabled />);
  await expect.element(input).toBeDisabled();
  expect(screen.container.querySelector<HTMLInputElement>('input[type=hidden]')!.disabled).toBe(
    true,
  );
  await userEvent.click(submit);
  await expect.poll(() => result?.quantity).toBeUndefined();
});

test('invalid props/structures fail clearly and hideStepper removes automatic controls', () => {
  const scientific: Intl.NumberFormatOptions = { notation: 'scientific' };
  const invalidProps: NumberField.Props[] = [
    { min: 5, max: 1 },
    { step: 0 },
    { step: -1 },
    { largeStep: Infinity },
    { value: NaN },
    { formatOptions: scientific },
  ];
  for (const props of invalidProps)
    expect(() => renderToString(<NumberField {...props} />)).toThrow(/\[IDS\] NumberField/);
  for (const invalid of [
    <NumberField>
      <NumberField.Input />
      <NumberField.Input />
    </NumberField>,
    <NumberField>
      <NumberField.Input asChild>
        <textarea />
      </NumberField.Input>
    </NumberField>,
    <NumberField>
      <NumberField.Input>text</NumberField.Input>
    </NumberField>,
  ])
    expect(() => renderToString(invalid)).toThrow(/\[IDS\] `<NumberField/);
  expect(() => renderToString(<NumberField.Input />)).toThrow(
    /`<NumberField.Input>` must be used inside `<NumberField>`/,
  );
  expect(parse(renderToString(<NumberField hideStepper />)).querySelector('button')).toBeNull();
});

function layoutOf(shell: HTMLElement) {
  return Array.from(shell.children, (el) =>
    el instanceof HTMLElement && 'numberFieldAdornment' in el.dataset
      ? el.textContent
      : el instanceof HTMLElement && 'numberFieldStepper' in el.dataset
        ? 'STEPPER'
        : el.tagName,
  );
}

test('Input values win over root values, but root and Input handlers both run', async () => {
  const events: Array<string | [string, number | null]> = [];
  const screen = await render(
    <NumberField
      id="root-id"
      placeholder="root"
      defaultValue={1}
      onChange={() => events.push('root-change')}
      onValueChange={(value) => events.push(['root-value', value])}
      onBlur={() => events.push('root-blur')}
    >
      <NumberField.Input
        placeholder="input"
        onChange={() => events.push('input-change')}
        onBlur={() => events.push('input-blur')}
      />
    </NumberField>,
  );
  const input = screen.getByRole('spinbutton');
  await expect.element(input).toHaveAttribute('id', 'root-id');
  await expect.element(input).toHaveAttribute('placeholder', 'input');
  await userEvent.fill(input, '4');
  node(input).blur();
  expect(events.filter((event) => typeof event === 'string')).toEqual([
    'root-change',
    'input-change',
    'root-blur',
    'input-blur',
  ]);
  expect(events.filter(Array.isArray), 'reported once, wherever the edit lands first').toEqual([
    ['root-value', 4],
  ]);
});

test('Input disabled/readOnly override the root and drive container state', async () => {
  const screen = await render(
    <NumberField defaultValue={1} disabled>
      <NumberField.Input disabled={false} />
    </NumberField>,
  );
  const input = screen.getByRole('spinbutton');
  await expect.element(input).not.toHaveAttribute('disabled');
  expect(shellOf(input).dataset.disabled).toBeUndefined();
  await screen.rerender(
    <NumberField defaultValue={1}>
      <NumberField.Input readOnly />
    </NumberField>,
  );
  expect(shellOf(input).dataset.readonly).toBe('');
  await expect.element(screen.getByRole('button', { name: '값 늘리기' })).toBeDisabled();
});

test('children without an Input become leading adornments before an auto-inserted Input', async () => {
  const screen = await render(
    <NumberField defaultValue={1}>
      <span>$</span>
    </NumberField>,
  );
  const input = screen.getByRole('spinbutton');
  expect(layoutOf(shellOf(input))).toEqual(['$', 'INPUT', 'STEPPER']);
  await screen.rerender(
    <NumberField defaultValue={1} hideStepper>
      <span>$</span>
    </NumberField>,
  );
  expect(layoutOf(shellOf(input))).toEqual(['$', 'INPUT']);
});

test('Input inside a Fragment splits adornments, and Stepper/Clear render unwrapped', async () => {
  const screen = await render(
    <NumberField defaultValue={1}>
      <>
        <span>Lead</span>
        <NumberField.Input />
        <span>Trail</span>
        <NumberField.Clear />
        <NumberField.Stepper />
      </>
    </NumberField>,
  );
  expect(layoutOf(shellOf(screen.getByRole('spinbutton')))).toEqual([
    'Lead',
    'INPUT',
    'Trail',
    'BUTTON',
    'STEPPER',
  ]);
  expect(screen.container.querySelector('[data-number-field-adornment] button')).toBeNull();
});

test('asChild merges Input and root props over the child and keeps the numeric model', async () => {
  let seen: HTMLInputElement | null = null;
  const events: Array<string | [string, number | null]> = [];
  const screen = await render(
    <form aria-label="Payment">
      <NumberField
        name="amount"
        defaultValue={2}
        ref={(element: HTMLInputElement | null) => {
          seen = element;
        }}
        onValueChange={(value) => events.push(['root', value])}
      >
        <NumberField.Input asChild placeholder="input">
          <input
            name="child"
            placeholder="child"
            spellCheck={false}
            onChange={() => events.push('child')}
          />
        </NumberField.Input>
      </NumberField>
    </form>,
  );
  const input = screen.getByRole('spinbutton');
  expect(seen).toBe(input.element());
  await expect.element(input).toHaveAttribute('placeholder', 'input');
  await expect.element(input).toHaveAttribute('spellcheck', 'false');
  expect(node(input).name).toBe('');
  await expect.element(input).toHaveAttribute('data-number-field-input');
  await userEvent.fill(input, '3');
  expect(events.filter((event) => event === 'child')).toEqual(['child']);
  expect(events.filter(Array.isArray)).toEqual([['root', 3]]);
  await expect.element(screen.getByRole('form')).toHaveFormValues({ amount: '3' });
});

test('Home and End jump to the bounds, Alt steps by smallStep, PageUp by largeStep', async () => {
  const form = controlled({ defaultValue: 5, min: 0, max: 10 });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  node(input).focus();
  expect(await keyWasPrevented('{End}', 'End')).toBe(true);
  expect(form.value()).toBe(10);
  await userEvent.keyboard('{Home}');
  expect(form.value()).toBe(0);
  await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
  expect(form.value()).toBe(0.1);
  await userEvent.keyboard('{PageUp}');
  expect(form.value()).toBe(10);
  await screen.rerender(<NumberField key="unbounded" defaultValue={5} />);
  node(input).focus();
  expect(await keyWasPrevented('{Home}', 'Home'), 'without a bound the caret moves').toBe(false);
});

test('an explicit step snaps typed values on blur and arrows land on the grid', async () => {
  const half = controlled({ step: 0.5 });
  const screen = await render(half.node);
  const input = screen.getByRole('spinbutton');
  await userEvent.fill(input, '1.3');
  expect(half.value(), 'typing is not snapped while editing').toBe(1.3);
  node(input).blur();
  await expect.poll(() => half.value()).toBe(1.5);
  await userEvent.fill(input, '1.2');
  await userEvent.keyboard('{ArrowUp}');
  expect(half.value(), 'an off-grid value steps to the next grid value').toBe(1.5);
  await userEvent.keyboard('{ArrowUp}');
  expect(half.value()).toBe(2);
  await screen.unmount();

  const odd = controlled({ min: 1, max: 10, step: 2 });
  const second = await render(odd.node);
  const oddInput = second.getByRole('spinbutton');
  await userEvent.fill(oddInput, '4');
  node(oddInput).blur();
  await expect.poll(() => odd.value(), { message: 'the grid is anchored at min: 1, 3, 5' }).toBe(5);
  await userEvent.fill(oddInput, '20');
  node(oddInput).blur();
  await expect.poll(() => odd.value(), { message: 'clamping keeps the value on the grid' }).toBe(9);
  await second.unmount();

  const free = controlled({});
  const third = await render(free.node);
  const freeInput = third.getByRole('spinbutton');
  await userEvent.fill(freeInput, '1.3');
  node(freeInput).blur();
  await expect.element(shellOf(freeInput)).not.toHaveAttribute('data-focused');
  expect(free.value(), 'without an explicit step nothing is snapped').toBe(1.3);
});

test('a value set from outside is left alone when the field is focused and left', async () => {
  const form = controlled({ min: 0, max: 10, step: 1, defaultValue: 20 });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  await userEvent.click(input);
  await expect.element(shellOf(input)).toHaveAttribute('data-focused');
  node(input).blur();
  await expect.element(shellOf(input)).not.toHaveAttribute('data-focused');
  expect(form.value()).toBe(20);
  expect(form.changes).toEqual([]);
  await expect.element(input).toHaveAttribute('aria-invalid', 'true');
  expect(node(input).validity.customError).toBe(true);
  expect(node(input).validationMessage).toBe('값은 10 이하여야 합니다.');
  await userEvent.fill(input, '3');
  expect(node(input).validity.valid).toBe(true);
});

test('out-of-range values reach Field.Error through native validity', async () => {
  const screen = await render(
    <form onSubmit={(event) => event.preventDefault()}>
      <Field>
        <Field.Label>Seats</Field.Label>
        <NumberField min={1} defaultValue={0} name="seats" />
        <Field.Error />
      </Field>
      <button type="submit">Submit</button>
    </form>,
  );
  const error = () => screen.container.querySelector('[data-field-part=error]');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await expect.poll(() => error()?.textContent).toBe('값은 1 이상이어야 합니다.');
  const input = screen.getByRole('spinbutton', { name: 'Seats' });
  node(input).focus();
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(input).toHaveValue('1');
  await expect
    .poll(error, { message: 'a step without an input event still clears the error' })
    .toBeNull();
});

test('the wheel steps only when allowed and the input has focus', async () => {
  const form = controlled({ defaultValue: 1, allowWheelScrub: true });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  expect(await wheelWasPrevented(input, -100), 'an unfocused field lets the page scroll').toBe(
    false,
  );
  expect(form.changes).toEqual([]);
  node(input).focus();
  expect(await wheelWasPrevented(input, -100)).toBe(true);
  await expect.poll(() => form.value()).toBe(2);
  await userEvent.keyboard('{Shift>}');
  expect(await wheelWasPrevented(input, 100)).toBe(true);
  await userEvent.keyboard('{/Shift}');
  await expect.poll(() => form.value()).toBe(-8);
  await userEvent.keyboard('{Control>}');
  expect(await wheelWasPrevented(input, -100), 'ctrl+wheel stays the browser zoom').toBe(false);
  await userEvent.keyboard('{/Control}');
  expect(form.changes).toEqual([2, -8]);
});

test('holding a stepper repeats and speeds up; releasing stops it', async () => {
  const form = controlled({ defaultValue: 0 });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  const increment = screen.getByRole('button', { name: '값 늘리기' });
  await expect.element(increment).toHaveAttribute('tabindex', '-1');
  let atPress: { value?: number | null; focused?: Element | null } = {};
  let held: number | null | undefined;
  window.addEventListener(
    'pointerdown',
    () => {
      atPress = { value: form.changes.at(-1), focused: document.activeElement };
    },
    { once: true },
  );
  window.addEventListener(
    'pointerup',
    () => {
      held = form.changes.at(-1);
    },
    { once: true, capture: true },
  );
  await userEvent.click(increment, { delay: 900 });
  expect(atPress.value, 'the press steps at once').toBe(1);
  expect(atPress.focused, 'a mouse press keeps focus in the input').toBe(input.element());
  expect(held, `holding repeats (reached ${held})`).toBeGreaterThanOrEqual(4);
  expect(form.changes.at(-1), 'the click after a press does not step again').toBe(held);
  await wait(300);
  expect(form.changes.at(-1), 'releasing stops the repeat').toBe(held);
  await expect.element(input).toHaveFocus();
});

test('a stepper press steps even when its pointer cannot be captured', async () => {
  const form = controlled({ defaultValue: 0 });
  const screen = await render(form.node);
  const increment = screen.getByRole('button', { name: '값 늘리기', exact: true }).element();
  const aPointerTheBrowserDoesNotTrack = { pointerId: 987, pointerType: 'mouse', button: 0 };
  increment.dispatchEvent(
    new PointerEvent('pointerdown', { ...aPointerTheBrowserDoesNotTrack, bubbles: true }),
  );
  increment.dispatchEvent(
    new PointerEvent('pointerup', { ...aPointerTheBrowserDoesNotTrack, bubbles: true }),
  );
  await expect.poll(() => form.value()).toBe(1);
});

test('Increment and Decrement lay out beside the input; Escape clears with a Clear part', async () => {
  const form = controlled({
    defaultValue: 2,
    children: (
      <>
        <NumberField.Decrement />
        <NumberField.Input />
        <NumberField.Clear />
        <NumberField.Increment />
      </>
    ),
  });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  expect(
    Array.from(
      shellOf(input).children,
      (el) => (el as HTMLElement).dataset.numberFieldStep ?? el.tagName,
    ),
  ).toEqual(['decrement', 'INPUT', 'BUTTON', 'increment']);
  expect(screen.container.querySelectorAll('[data-number-field-stepper]')).toHaveLength(0);
  await userEvent.click(screen.getByRole('button', { name: '값 줄이기' }));
  expect(form.value()).toBe(1);
  node(input).focus();
  expect(await keyWasPrevented('{Escape}', 'Escape')).toBe(true);
  expect(form.value()).toBe(null);
});

test('input hints: inputmode follows the range and grid, autocomplete is off', () => {
  const hints = (props: NumberField.Props) =>
    parse(renderToString(<NumberField {...props} />)).querySelector('input')!;
  expect(hints({}).getAttribute('inputmode')).toBe('decimal');
  expect(hints({ min: 0, step: 1 }).getAttribute('inputmode')).toBe('numeric');
  expect(hints({ inputMode: 'text' }).getAttribute('inputmode')).toBe('text');
  expect(hints({}).getAttribute('autocomplete')).toBe('off');
  expect(hints({ autoComplete: 'on' }).getAttribute('autocomplete')).toBe('on');
});

test('a tap on a stepper steps without focusing the input, and a cancelled press stops', async () => {
  const form = controlled({ defaultValue: 0 });
  const screen = await render(form.node);
  const input = screen.getByRole('spinbutton');
  const increment = screen.getByRole('button', { name: '값 늘리기' });
  await cdp().send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [touchPointOn(increment)],
  });
  await expect.poll(() => form.changes).toEqual([1]);
  await expect.element(input, { message: 'no on-screen keyboard for a tap' }).not.toHaveFocus();
  await cdp().send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await wait(500);
  expect(form.changes, 'a cancelled press does not keep stepping').toEqual([1]);
});

test('on iOS a field that accepts negatives asks for the full keyboard', async () => {
  const iPhone = [
    vi
      .spyOn(navigator, 'userAgent', 'get')
      .mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)'),
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('iPhone'),
    vi.spyOn(navigator, 'maxTouchPoints', 'get').mockReturnValue(5),
  ];
  try {
    const screen = await render(<NumberField aria-label="Delta" />);
    await expect
      .element(screen.getByRole('spinbutton', { name: 'Delta' }))
      .toHaveAttribute('inputmode', 'text');
    await screen.rerender(<NumberField key="positive" aria-label="Count" min={0} />);
    await expect
      .element(screen.getByRole('spinbutton', { name: 'Count' }))
      .toHaveAttribute('inputmode', 'decimal');
  } finally {
    for (const spy of iPhone) spy.mockRestore();
  }
});
