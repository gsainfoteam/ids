import { StrictMode } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { DateTimeField, Field, TimeField } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

type ClockProps = Pick<
  TimeField.Props,
  'name' | 'value' | 'defaultValue' | 'hourCycle' | 'disabled'
>;

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const col = (unit: string) =>
  document.querySelector<HTMLElement>(`[role=dialog] [data-time-column="${unit}"]`)!;
const option = (unit: string, n: number) =>
  col(unit).querySelector<HTMLElement>(`[data-time-option="${n}"]`)!;
const day = (n: number) =>
  document.querySelector<HTMLButtonElement>(`[data-calendar-day="2026-09-${n}"]`)!;
const d = (day = 15, hour = 9, minute = 30, second = 0) =>
  new Date(2026, 8, day, hour, minute, second);
const hiddenValue = () => document.querySelector<HTMLInputElement>('input[type=hidden]')?.value;
const resetSettles = () => new Promise((resolve) => setTimeout(resolve, 50));
const clockFields = [
  (props: ClockProps) => <TimeField {...props} />,
  (props: ClockProps) => <DateTimeField today={d()} {...props} />,
];

test('SSR formatting, local serialization, Field ARIA and diagnostics for both clock fields', () => {
  for (const [field, expected, model] of [
    [<TimeField name="when" defaultValue={d()} hourCycle="24h" />, '09:30', '09:30'],
    [
      <DateTimeField
        name="when"
        defaultValue={d()}
        format={{ dateStyle: 'long', timeStyle: 'short' }}
        hourCycle="24h"
      />,
      '2026년 9월 15일 09:30',
      '2026-09-15T09:30',
    ],
  ] as const) {
    const doc = parse(
      renderToString(
        <form>
          <Field required>
            <Field.Label>When</Field.Label>
            {field}
          </Field>
        </form>,
      ),
    );
    const combobox = doc.querySelector('[role=combobox]')!;
    expect(combobox.textContent).toContain(expected);
    expect(new FormData(doc.querySelector('form')!).get('when')).toBe(model);
    expect(doc.querySelector('label')!.htmlFor).toBe(combobox.id);
    expect(combobox.getAttribute('aria-required')).toBe('true');
    expect(doc.querySelector('button button')).toBeNull();
  }
  const shown = (props: DateTimeField.Props) =>
    parse(renderToString(<DateTimeField defaultValue={d(15, 14, 5)} {...props} />)).querySelector(
      '[role=combobox]',
    )!.textContent;
  expect(shown({})).toBe('2026. 09. 15. 오후 2:05');
  expect(shown({ locale: 'en-US' })).toBe('09/15/2026, 2:05 PM');
  expect(shown({ hourCycle: '24h' })).toBe('2026. 09. 15. 14:05');
  expect(shown({ locale: 'de-DE' })).toBe('15.09.2026, 14:05');
  expect(shown({ precision: 'second', locale: 'ja-JP' })).toBe('2026/09/15 14:05:00');
  expect(shown({ format: (date, locale) => `${locale} ${date.getDate()}` })).toBe('ko-KR 15');
  expect(() => shown({ locale: '-' })).toThrow(/BCP 47/);
  const empty = parse(renderToString(<DateTimeField />));
  expect(empty.querySelector('[role=combobox]')!.textContent).toBe('날짜와 시간 선택');
  expect(() => renderToString(<DateTimeField min={d(16)} max={d(15)} />)).toThrow(/min/);
  const precise = parse(
    renderToString(
      <form>
        <DateTimeField name="at" defaultValue={d(15, 9, 30, 5)} precision="second" />
      </form>,
    ),
  );
  expect(precise.querySelector<HTMLInputElement>('input[type=hidden]')!.value).toBe(
    '2026-09-15T09:30:05',
  );
});

test('both clock fields: prevented and real native reset, controlled empty, disabled omission', async () => {
  for (const field of clockFields) {
    const screen = await render(
      <form>
        {field({ name: 'when', defaultValue: d(), hourCycle: '24h' })}
        <button type="reset">초기화</button>
      </form>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(option('hour', 10));
    await userEvent.keyboard('{Escape}');
    const form = screen.container.querySelector('form')!;
    form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    await userEvent.click(screen.getByRole('button', { name: '초기화' }));
    await resetSettles();
    expect(hiddenValue()).toMatch(/10:30/);
    await userEvent.click(screen.getByRole('button', { name: '초기화' }));
    await expect.poll(hiddenValue).toMatch(/09:30/);
    await screen.rerender(<form>{field({ name: 'when', value: d(), disabled: true })}</form>);
    expect(new FormData(screen.container.querySelector('form')!).has('when')).toBe(false);
    await screen.rerender(field({ value: null }));
    await expect.element(screen.getByRole('combobox')).toMatchTextContent('선택');
    await screen.unmount();
  }
});

test('the calendar keeps the clock time and the clock keeps the day', async () => {
  let value = null as Date | null;
  const screen = await render(
    <StrictMode>
      <DateTimeField
        defaultValue={d()}
        today={d()}
        hourCycle="24h"
        step={15}
        onValueChange={(next) => (value = next)}
      />
    </StrictMode>,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(day(15)).toHaveFocus();
  await userEvent.click(day(18));
  expect([value?.getDate(), value?.getHours(), value?.getMinutes()]).toEqual([18, 9, 30]);
  await userEvent.click(option('hour', 14));
  expect([value?.getDate(), value?.getHours(), value?.getMinutes()]).toEqual([18, 14, 30]);
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('combobox')).toMatchTextContent('2026. 09. 18. 14:30');
});

test('limits cover the whole moment: first and last day clamp the clock, blocked days skip', async () => {
  let value = null as Date | null;
  const screen = await render(
    <DateTimeField
      defaultValue={d(16, 12)}
      today={d()}
      hourCycle="24h"
      step={15}
      min={d(15, 9, 35)}
      max={d(18, 10, 20)}
      disabled={(date) => date.getDate() === 17}
      onValueChange={(next) => (value = next)}
    />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(day(14)).toHaveAttribute('data-disabled');
  await expect.element(day(17)).toHaveAttribute('data-disabled');
  await userEvent.click(day(18));
  expect([value?.getHours(), value?.getMinutes()]).toEqual([10, 15]);
  await expect.element(option('hour', 11)).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(day(15));
  expect(value?.getMinutes()).toBe(15);
  await expect.element(option('hour', 8)).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(option('hour', 9));
  expect(value?.getMinutes()).toBe(45);
});

test('an empty field shows no time until one is picked, then builds it on today', async () => {
  let value = undefined as Date | null | undefined;
  const screen = await render(
    <DateTimeField today={d(20)} hourCycle="24h" onValueChange={(next) => (value = next)} />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  expect(document.querySelector('[data-time-picker] [aria-selected=true]')).toBeNull();
  await userEvent.click(option('hour', 14));
  expect([value?.getDate(), value?.getHours(), value?.getMinutes()]).toEqual([20, 14, 0]);
  await userEvent.keyboard('{Delete}');
  expect(value).toBeNull();
  if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/New_York') {
    await userEvent.keyboard('{Escape}');
    await screen.rerender(
      <DateTimeField
        value={new Date(2026, 2, 7, 2, 30)}
        today={new Date(2026, 2, 7)}
        hourCycle="24h"
        onValueChange={(next) => (value = next)}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(document.querySelector<HTMLElement>('[data-calendar-day="2026-03-08"]')!);
    expect(value?.getHours()).not.toBe(2);
  }
});

test('react-hook-form value mode for both clock fields: required focus, Date model, reset', async () => {
  for (const field of clockFields) {
    type Values = { when: Date | null };
    const submitted = vi.fn();
    let methods!: UseFormReturn<Values>;
    function App() {
      const form = useForm<Values>({ defaultValues: { when: null } });
      methods = form;
      return (
        <FormProvider {...form}>
          <form noValidate onSubmit={form.handleSubmit(submitted)}>
            <RHFField name="when" controlMode="value" registerOptions={{ required: 'Required' }}>
              <RHFField.Label>When</RHFField.Label>
              {field({ hourCycle: '24h' })}
              <RHFField.Error />
            </RHFField>
            <button type="submit">제출</button>
          </form>
        </FormProvider>
      );
    }
    const screen = await render(<App />);
    const trigger = screen.getByRole('combobox', { name: 'When' });
    await userEvent.click(screen.getByRole('button', { name: '제출' }));
    await expect.element(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(option('hour', 10));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: '제출' }));
    await expect.poll(() => submitted.mock.lastCall?.[0].when).toBeInstanceOf(Date);
    expect(submitted.mock.lastCall?.[0].when.getHours()).toBe(10);
    methods.reset();
    await expect.poll(hiddenValue).toBeUndefined();
    await expect.element(trigger).toMatchTextContent('선택');
    await screen.unmount();
  }
});

test('a sub-second range with no representable time disables the day and the clock', async () => {
  const min = new Date(2026, 8, 15, 9, 30, 0, 1);
  const max = new Date(2026, 8, 15, 9, 30, 0, 999);
  const screen = await render(
    <DateTimeField today={d()} min={min} max={max} precision="second" hourCycle="24h" />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(day(15)).toHaveAttribute('data-disabled');
  await expect.element(col('hour')).toHaveAttribute('aria-disabled', 'true');
  await expect
    .element(screen.getByRole('dialog'))
    .toMatchTextContent('고를 수 있는 날짜를 먼저 고르세요.');
});
