import { StrictMode } from 'react';

import {
  BuddhistCalendar,
  CalendarDate,
  CalendarDateTime,
  Time,
  toCalendar,
} from '@internationalized/date';
import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { DateTimeField, Field, TimeField } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

type ClockValue = CalendarDateTime | Time;
type ClockProps = Pick<TimeField.Props, 'name' | 'hourCycle' | 'disabled'> & {
  value?: ClockValue | null;
  defaultValue?: ClockValue | null;
};

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const col = (unit: string) =>
  document.querySelector<HTMLElement>(`[role=dialog] [data-time-column="${unit}"]`)!;
const option = (unit: string, n: number) =>
  col(unit).querySelector<HTMLElement>(`[data-time-option="${n}"]`)!;
const day = (n: number) =>
  document.querySelector<HTMLButtonElement>(`[data-calendar-day="2026-09-${n}"]`)!;
const d = (day = 15, hour = 9, minute = 30, second = 0) =>
  new CalendarDateTime(2026, 9, day, hour, minute, second);
const t = (day = 15) => new CalendarDate(2026, 9, day);
const hiddenValue = () => document.querySelector<HTMLInputElement>('input[type=hidden]')?.value;
const resetSettles = () => new Promise((resolve) => setTimeout(resolve, 50));
const clockFields = [
  {
    nineThirty: new Time(9, 30),
    valueType: Time,
    pickedTen: '10:00',
    hourOf: (value: ClockValue) => (value as Time).hour,
    field: (props: ClockProps) => <TimeField {...(props as TimeField.Props)} />,
  },
  {
    nineThirty: d(),
    valueType: CalendarDateTime,
    pickedTen: '2026-09-15T10:00',
    hourOf: (value: ClockValue) => (value as CalendarDateTime).hour,
    field: (props: ClockProps) => <DateTimeField today={t()} {...(props as DateTimeField.Props)} />,
  },
];

test('SSR formatting, local serialization, Field ARIA and diagnostics for both clock fields', () => {
  for (const [field, expected, model] of [
    [<TimeField name="when" defaultValue={new Time(9, 30)} hourCycle="24h" />, '09:30', '09:30'],
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
  expect(shown({ format: (value, locale) => `${locale} ${value.day} ${value.hour}` })).toBe(
    'ko-KR 15 14',
  );
  // @ts-expect-error A Date is no longer a date-time value.
  expect(() => shown({ defaultValue: new Date(2026, 8, 15) })).toThrow(
    /expected a CalendarDateTime/,
  );
  // @ts-expect-error min takes a CalendarDateTime.
  expect(() => shown({ min: new CalendarDate(2026, 9, 15) })).toThrow(
    /expected a CalendarDateTime/,
  );
  const buddhist = toCalendar(d(15), new BuddhistCalendar());
  expect(() => shown({ defaultValue: buddhist })).toThrow(/only gregorian/);
  const lookalike = { ...d(15, 14, 5), calendar: { identifier: 'gregory' }, compare: () => 0 };
  expect(shown({ defaultValue: lookalike as unknown as CalendarDateTime })).toBe(
    '2026. 09. 15. 오후 2:05',
  );
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
  for (const { field, nineThirty } of clockFields) {
    const screen = await render(
      <form>
        {field({ name: 'when', defaultValue: nineThirty, hourCycle: '24h' })}
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
    await screen.rerender(
      <form>{field({ name: 'when', value: nineThirty, disabled: true })}</form>,
    );
    expect(new FormData(screen.container.querySelector('form')!).has('when')).toBe(false);
    await screen.rerender(field({ value: null }));
    await expect.element(screen.getByRole('combobox')).toMatchTextContent('선택');
    await screen.unmount();
  }
});

test('the calendar keeps the clock time and the clock keeps the day', async () => {
  let value = null as CalendarDateTime | null;
  const screen = await render(
    <StrictMode>
      <DateTimeField
        defaultValue={d()}
        today={t()}
        hourCycle="24h"
        step={15}
        onValueChange={(next) => (value = next)}
      />
    </StrictMode>,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(day(15)).toHaveFocus();
  await userEvent.click(day(18));
  expect([value?.day, value?.hour, value?.minute]).toEqual([18, 9, 30]);
  await userEvent.click(option('hour', 14));
  expect([value?.day, value?.hour, value?.minute]).toEqual([18, 14, 30]);
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('combobox')).toMatchTextContent('2026. 09. 18. 14:30');
});

test('limits cover the whole moment: first and last day clamp the clock, blocked days skip', async () => {
  let value = null as CalendarDateTime | null;
  const screen = await render(
    <DateTimeField
      defaultValue={d(16, 12)}
      today={t()}
      hourCycle="24h"
      step={15}
      min={d(15, 9, 35)}
      max={d(18, 10, 20)}
      disabled={(date) => date.day === 17}
      onValueChange={(next) => (value = next)}
    />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(day(14)).toHaveAttribute('data-disabled');
  await expect.element(day(17)).toHaveAttribute('data-disabled');
  await userEvent.click(day(18));
  expect([value?.hour, value?.minute]).toEqual([10, 15]);
  await expect.element(option('hour', 11)).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(day(15));
  expect(value?.minute).toBe(15);
  await expect.element(option('hour', 8)).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(option('hour', 9));
  expect(value?.minute).toBe(45);
});

test('an empty field shows no time until one is picked, then builds it on today', async () => {
  let value = undefined as CalendarDateTime | null | undefined;
  const screen = await render(
    <DateTimeField today={t(20)} hourCycle="24h" onValueChange={(next) => (value = next)} />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  expect(document.querySelector('[data-time-picker] [aria-selected=true]')).toBeNull();
  await userEvent.click(option('hour', 14));
  expect([value?.day, value?.hour, value?.minute]).toEqual([20, 14, 0]);
  await userEvent.keyboard('{Delete}');
  expect(value).toBeNull();
});

test('react-hook-form value mode for both clock fields: required focus, value model, reset', async () => {
  for (const { field, valueType, hourOf, pickedTen } of clockFields) {
    type Values = { when: ClockValue | null };
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
              {field({ name: 'when', hourCycle: '24h' })}
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
    await expect.poll(() => submitted.mock.lastCall?.[0].when).toBeInstanceOf(valueType);
    expect(hourOf(submitted.mock.lastCall?.[0].when)).toBe(10);
    expect(hiddenValue()).toBe(pickedTen);
    methods.reset();
    await expect.poll(hiddenValue).toBeUndefined();
    await expect.element(trigger).toMatchTextContent('선택');
    await screen.unmount();
  }
});

test('a sub-second range with no representable time disables the day and the clock', async () => {
  const min = new CalendarDateTime(2026, 9, 15, 9, 30, 0, 1);
  const max = new CalendarDateTime(2026, 9, 15, 9, 30, 0, 999);
  const screen = await render(
    <DateTimeField today={t()} min={min} max={max} precision="second" hourCycle="24h" />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(day(15)).toHaveAttribute('data-disabled');
  await expect.element(col('hour')).toHaveAttribute('aria-disabled', 'true');
  await expect
    .element(screen.getByRole('dialog'))
    .toMatchTextContent('고를 수 있는 날짜를 먼저 고르세요.');
});

test('a min with milliseconds starts the clock at the next whole second, only on its own day', async () => {
  let value = null as CalendarDateTime | null;
  await render(
    <DateTimeField
      defaultValue={d(15, 9, 30, 0)}
      today={t()}
      min={new CalendarDateTime(2026, 9, 15, 9, 30, 0, 500)}
      max={d(16, 8, 0)}
      precision="second"
      step={20}
      hourCycle="24h"
      onValueChange={(next) => (value = next)}
    />,
  );
  await userEvent.click(document.querySelector<HTMLElement>('[role=combobox]')!);
  await expect.element(option('hour', 8)).toHaveAttribute('aria-disabled', 'true');
  await expect.element(option('second', 0)).toHaveAttribute('aria-disabled', 'true');
  await expect.element(option('second', 20)).not.toHaveAttribute('aria-disabled');
  await userEvent.click(day(16));
  expect(value?.toString()).toBe('2026-09-16T08:00:00');
  await expect.element(option('hour', 9)).toHaveAttribute('aria-disabled', 'true');
  await expect.element(option('hour', 0)).not.toHaveAttribute('aria-disabled');
  await userEvent.click(day(15));
  expect(value?.toString()).toBe('2026-09-15T09:30:20');
});

test('every wall-clock time can be picked, and the local time zone shifts nothing', async () => {
  onTestFinished(async () => {
    await cdp().send('Emulation.setTimezoneOverride', { timezoneId: '' });
  });
  for (const timezoneId of ['America/New_York', 'Pacific/Kiritimati', 'Pacific/Pago_Pago']) {
    await cdp().send('Emulation.setTimezoneOverride', { timezoneId });
    let value = null as CalendarDateTime | null;
    const screen = await render(
      <form>
        <DateTimeField
          name="when"
          defaultValue={new CalendarDateTime(2026, 3, 7, 2, 30)}
          today={new CalendarDate(2026, 3, 7)}
          hourCycle="24h"
          onValueChange={(next) => (value = next)}
        />
      </form>,
    );
    const trigger = screen.getByRole('combobox');
    await expect.element(trigger).toMatchTextContent('2026. 03. 07. 02:30');
    await userEvent.click(trigger);
    await userEvent.click(document.querySelector<HTMLElement>('[data-calendar-day="2026-03-08"]')!);
    expect(value?.toString()).toBe('2026-03-08T02:30:00');
    await expect.element(option('hour', 2)).not.toHaveAttribute('aria-disabled');
    await userEvent.keyboard('{Escape}');
    await expect.element(trigger).toMatchTextContent('2026. 03. 08. 02:30');
    expect(new FormData(screen.container.querySelector('form')!).get('when')).toBe(
      '2026-03-08T02:30',
    );
    await screen.unmount();
  }
});
