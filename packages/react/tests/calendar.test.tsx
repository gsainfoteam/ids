import { format } from 'date-fns';
import { arEG } from 'date-fns/locale/ar-EG';
import { de } from 'date-fns/locale/de';
import { es } from 'react-day-picker/locale';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Calendar } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const ssr = (props: Calendar.Props) => parse(renderToString(<Calendar {...props} />));
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const dateKey = (date: Date | null | undefined) => date && format(date, 'yyyy-MM-dd');
const day = (key: string) =>
  document.querySelector<HTMLButtonElement>(`[data-calendar-day="${key}"]`)!;

test('SSR: Korean by default, two months without duplicate dates, one tab stop', () => {
  const doc = ssr({ defaultMonth: d(2024, 2, 1), today: d(2024, 2, 29), monthsToShow: 2 });
  const grids = doc.querySelectorAll('[role=grid]');
  expect(grids).toHaveLength(2);
  expect(grids[0].getAttribute('aria-label')).toBe('2024년 2월');
  expect(doc.querySelector('[data-calendar]')!.getAttribute('aria-label')).toBe('달력');
  expect(doc.querySelector('[data-calendar]')!.getAttribute('lang')).toBe('ko');
  expect(doc.querySelector('th')!.textContent).toBe('일');
  expect(doc.querySelector('th')!.getAttribute('aria-label')).toBe('일요일');
  const today = doc.querySelector('[data-calendar-day][data-today]')!;
  expect(today.textContent).toBe('29');
  expect(today.getAttribute('aria-label')).toBe('오늘, 2024년 2월 29일 목요일');
  const keys = [...doc.querySelectorAll('[data-calendar-day]')].map((node) =>
    node.getAttribute('data-calendar-day'),
  );
  expect(new Set(keys).size).toBe(keys.length);
  expect(doc.querySelectorAll('[data-calendar-day][tabindex="0"]')).toHaveLength(1);
  expect(doc.querySelectorAll('[aria-label="이전 달"]')).toHaveLength(1);
  expect(doc.querySelectorAll('[aria-label="다음 달"]')).toHaveLength(1);
  expect([...doc.querySelectorAll('[role=status]')].map((node) => node.textContent)).toEqual([
    '2024년 2월',
    '2024년 3월',
  ]);
});

test('a tag or a date-fns Locale drives names, the first weekday and the day labels', () => {
  const first = (props: Calendar.Props) =>
    ssr({ today: d(2026, 9, 15), ...props }).querySelector('th')!;
  expect(first({ locale: 'en-US' }).textContent).toBe('Su');
  expect(first({ locale: de }).getAttribute('aria-label')).toBe('Montag');
  expect(first({ weekStartsOn: 1 }).getAttribute('aria-label')).toBe('월요일');
  const arabic = ssr({ locale: arEG, numerals: 'arab', today: d(2026, 9, 15) });
  expect(arabic.querySelector('[data-calendar-day="2026-09-15"]')!.textContent).toBe('١٥');
  expect(
    ssr({ locale: 'en-US', today: d(2026, 9, 14) })
      .querySelector('[data-calendar-day="2026-09-15"]')!
      .getAttribute('aria-label'),
  ).toBe('Tuesday, September 15th, 2026');
  expect(() => ssr({ locale: 'de-DE' })).toThrow(/no built-in date-fns locale/);
});

test('a locale from react-day-picker/locale keeps its own translated labels', () => {
  const doc = ssr({ locale: es, today: d(2026, 9, 15) });
  expect(doc.querySelector('[aria-label="Ir al mes anterior"]')).not.toBeNull();
  expect(doc.querySelector('[role=grid]')!.getAttribute('aria-label')).toBe('septiembre 2026');
});

test('diagnostics for mismatched values, limits and parts outside the calendar', () => {
  // @ts-expect-error A range takes { start, end }, not a date.
  expect(() => ssr({ selectionMode: 'range', value: d(2026, 1, 1) })).toThrow(/range requires/);
  expect(() => ssr({ min: d(2026, 2, 1), max: d(2026, 1, 1) })).toThrow(/min <= max/);
  expect(() => ssr({ monthsToShow: 0 })).toThrow(/monthsToShow/);
  // @ts-expect-error A week starts on 0 to 6.
  expect(() => ssr({ weekStartsOn: 7 })).toThrow(/weekStartsOn/);
  // @ts-expect-error A DayButton gets its day and modifiers from the calendar.
  expect(() => renderToString(<Calendar.DayButton />)).toThrow(/inside Calendar/);
});

test('keyboard: month ends clamp, Home and End follow the week start, Shift jumps', async () => {
  await render(
    <Calendar defaultValue={d(2024, 1, 31)} today={d(2024, 1, 1)} autoFocus weekStartsOn={1} />,
  );
  await expect.element(day('2024-01-31')).toHaveFocus();
  await userEvent.keyboard('{PageDown}');
  await expect.element(day('2024-02-29')).toHaveFocus();
  await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
  await expect.element(day('2025-02-28')).toHaveFocus();
  await userEvent.keyboard('{Shift>}{PageUp}{/Shift}');
  await expect.element(day('2024-02-28')).toHaveFocus();
  await userEvent.keyboard('{Shift>}{PageDown}{/Shift}{Home}');
  await expect.element(day('2025-02-24')).toHaveFocus();
  await userEvent.keyboard('{End}');
  await expect.element(day('2025-03-02')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}'.repeat(8));
  await expect.element(day('2025-03-10')).toHaveFocus();
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(day('2025-03-03')).toHaveFocus();
  await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
  await expect.element(day('2025-04-03')).toHaveFocus();
  await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
  await expect.element(day('2026-04-03')).toHaveFocus();
});

test('an inherited right-to-left direction swaps the horizontal arrows', async () => {
  const screen = await render(
    <div dir="rtl">
      <Calendar defaultValue={d(2026, 9, 15)} today={d(2026, 9, 15)} autoFocus />
    </div>,
  );
  await expect.element(screen.getByRole('group', { name: '달력' })).toHaveAttribute('dir', 'rtl');
  await expect.element(day('2026-09-15')).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(day('2026-09-16')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}{ArrowRight}');
  await expect.element(day('2026-09-14')).toHaveFocus();
});

test('single: blocked days refuse, the value is local midnight, a re-click is no change', async () => {
  const changes: (Date | null)[] = [];
  await render(
    <Calendar
      today={d(2026, 9, 15)}
      min={d(2026, 9, 10)}
      max={d(2026, 9, 20)}
      disabled={(date) => date.getDate() === 16}
      onValueChange={(next) => changes.push(next)}
    />,
  );
  await expect.element(day('2026-09-09')).toHaveAttribute('disabled');
  await expect.element(day('2026-09-16')).toHaveAttribute('disabled');
  await expect.element(day('2026-09-16')).toHaveAttribute('data-disabled');
  await userEvent.click(day('2026-09-09'), { force: true });
  await userEvent.click(day('2026-09-16'), { force: true });
  expect(changes).toEqual([]);
  await userEvent.click(day('2026-09-18'));
  expect(changes.map(dateKey)).toEqual(['2026-09-18']);
  expect(changes[0]?.getHours()).toBe(0);
  await userEvent.click(day('2026-09-18'));
  expect(changes).toHaveLength(1);
  await expect.element(day('2026-09-18')).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
  await expect.element(day('2026-09-15')).toHaveFocus();
  await expect.element(day('2026-09-18')).toHaveAttribute('data-selected');
  await expect.element(day('2026-09-15')).toHaveAttribute('data-today');
  await expect
    .element(day('2026-09-18'))
    .toHaveAttribute('aria-label', '2026년 9월 18일 금요일, 선택됨');
});

test('a DayPicker matcher blocks days, and equal min and max leave one day and no months', async () => {
  let value = null as Date | null;
  const screen = await render(
    <Calendar
      today={d(2026, 9, 15)}
      disabled={{ dayOfWeek: [0, 6] }}
      onValueChange={(next) => (value = next)}
    />,
  );
  await expect.element(day('2026-09-19')).toHaveAttribute('disabled');
  await expect.element(day('2026-09-18')).not.toHaveAttribute('disabled');
  await screen.rerender(
    <Calendar
      key="one day"
      today={d(2026, 9, 15)}
      min={d(2026, 9, 15)}
      max={d(2026, 9, 15)}
      onValueChange={(next) => (value = next)}
    />,
  );
  await userEvent.click(day('2026-09-15'));
  expect(dateKey(value)).toBe('2026-09-15');
  const previous = screen.getByRole('button', { name: '이전 달' });
  await expect.element(previous).toHaveAttribute('aria-disabled', 'true');
  previous.element().focus();
  await userEvent.click(previous, { force: true });
  await expect.element(previous).toHaveFocus();
  await expect.element(day('2026-09-15')).toBeInTheDocument();
});

test('range: a partial value, ordered ends, restart, and a preview under the pointer or focus', async () => {
  let value = null as Calendar.Range | null;
  const screen = await render(
    <Calendar
      selectionMode="range"
      today={d(2026, 9, 15)}
      onValueChange={(next) => (value = next)}
    />,
  );
  await userEvent.click(day('2026-09-20'));
  expect(dateKey(value?.start)).toBe('2026-09-20');
  expect(value?.end).toBeNull();
  await userEvent.hover(day('2026-09-24'));
  for (const key of ['2026-09-21', '2026-09-22', '2026-09-24'])
    await expect.element(day(key)).toHaveAttribute('data-range-preview');
  await expect.element(day('2026-09-20')).not.toHaveAttribute('data-range-preview');
  await expect.element(day('2026-09-25')).not.toHaveAttribute('data-range-preview');
  await expect.element(day('2026-09-24').parentElement).toHaveClass('rounded-e-standard');
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
  await expect.element(day('2026-09-18')).toHaveFocus();
  await expect.element(day('2026-09-18')).toHaveAttribute('data-range-preview');
  await expect.element(day('2026-09-24')).not.toHaveAttribute('data-range-preview');
  await userEvent.hover(day('2026-09-22'));
  await expect.element(day('2026-09-18')).not.toHaveAttribute('data-range-preview');
  await userEvent.hover(screen.getByRole('button', { name: '이전 달' }));
  await expect.element(day('2026-09-18')).toHaveAttribute('data-range-preview');
  await userEvent.click(day('2026-09-10'));
  expect(dateKey(value?.start)).toBe('2026-09-10');
  expect(dateKey(value?.end)).toBe('2026-09-20');
  await expect.element(day('2026-09-15').parentElement).toHaveAttribute('aria-selected', 'true');
  await expect.element(day('2026-09-15')).toHaveAttribute('data-range-middle');
  await expect.element(day('2026-09-10')).toHaveAttribute('data-range-start');
  await expect.element(day('2026-09-20')).toHaveAttribute('data-range-end');
  expect(document.querySelector('[data-range-preview]')).toBeNull();
  await userEvent.click(day('2026-09-23'));
  expect(value?.end).toBeNull();
  expect(dateKey(value?.start)).toBe('2026-09-23');
});

test('multiple toggles by day and marks the grid multiselectable', async () => {
  let value: Date[] = [];
  const screen = await render(
    <Calendar
      selectionMode="multiple"
      today={d(2026, 9, 15)}
      onValueChange={(next) => (value = next)}
    />,
  );
  await userEvent.click(day('2026-09-15'));
  await userEvent.click(day('2026-09-16'));
  expect(value.map(dateKey)).toEqual(['2026-09-15', '2026-09-16']);
  await userEvent.click(day('2026-09-15'));
  expect(value.map(dateKey)).toEqual(['2026-09-16']);
  await expect.element(screen.getByRole('grid')).toHaveAttribute('aria-multiselectable', 'true');
});

test('readOnly and none browse without changes; disabled blocks navigation and selection', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <Calendar today={d(2026, 9, 15)} onValueChange={onValueChange} readOnly />,
  );
  await userEvent.click(day('2026-09-15'));
  expect(onValueChange).not.toHaveBeenCalled();
  await expect.element(screen.getByRole('grid')).toHaveAttribute('aria-readonly', 'true');
  await userEvent.click(screen.getByRole('button', { name: '다음 달' }));
  await expect.element(day('2026-10-15')).toBeInTheDocument();
  await screen.rerender(
    <Calendar key="none" today={d(2026, 9, 15)} selectionMode="none" value={d(2026, 9, 18)} />,
  );
  await expect.element(day('2026-09-18')).toHaveAttribute('data-selected');
  await userEvent.click(day('2026-09-20'));
  await expect.element(day('2026-09-20')).not.toHaveAttribute('data-selected');
  await screen.rerender(
    <Calendar key="disabled" today={d(2026, 9, 15)} onValueChange={onValueChange} disabled />,
  );
  await userEvent.click(day('2026-09-15'), { force: true });
  expect(onValueChange).not.toHaveBeenCalled();
  await expect
    .element(screen.getByRole('button', { name: '다음 달' }))
    .toHaveAttribute('aria-disabled', 'true');
  expect(document.querySelector('[data-calendar-day][tabindex="0"]')).toBeNull();
  await expect
    .element(screen.getByRole('group', { name: '달력' }))
    .toHaveAttribute('data-disabled');
});

test('caption dropdowns jump by year and month within min and max', async () => {
  const months: Date[] = [];
  const screen = await render(
    <Calendar
      captionLayout="dropdown"
      today={d(2026, 9, 15)}
      min={d(2020, 3, 10)}
      max={d(2026, 10, 5)}
      onMonthChange={(next) => months.push(next)}
    />,
  );
  const [year, month] = screen.container.querySelectorAll('select');
  expect(year).toHaveAttribute('aria-label', '연도');
  expect(month).toHaveAttribute('aria-label', '월');
  expect(month).toHaveAttribute('data-field-input');
  expect([...year.options].map((option) => option.value)).toEqual([
    '2020',
    '2021',
    '2022',
    '2023',
    '2024',
    '2025',
    '2026',
  ]);
  expect(month.options[10].disabled).toBe(true);
  await userEvent.selectOptions(year, '2020');
  expect(dateKey(months.at(-1))).toBe('2020-09-01');
  expect(month.options[1].disabled).toBe(true);
  await userEvent.selectOptions(month, '3');
  expect(dateKey(months.at(-1))).toBe('2020-04-01');
  await expect.element(screen.getByRole('grid')).toHaveAttribute('aria-label', '2020년 4월');
  await expect.element(screen.getByRole('status')).toHaveTextContent('2020년 4월');
});

test('without limits the year menu spans a century either side of today', async () => {
  const screen = await render(<Calendar captionLayout="dropdown" today={d(2026, 9, 15)} />);
  const year = screen.getByRole('combobox', { name: '연도' }).element() as HTMLSelectElement;
  expect(year.options[0].value).toBe('1926');
  expect(year.options[year.options.length - 1].value).toBe('2126');
  expect(year).toHaveValue('2026');
});

test('a month picked in the second caption lands in the second grid', async () => {
  const months: Date[] = [];
  const screen = await render(
    <Calendar
      captionLayout="dropdown"
      monthsToShow={2}
      today={d(2026, 9, 15)}
      onMonthChange={(next) => months.push(next)}
    />,
  );
  const selects = screen.getByRole('combobox', { name: '월' });
  expect(selects.elements()).toHaveLength(2);
  await userEvent.selectOptions(selects.nth(1), '0');
  expect(dateKey(months.at(-1))).toBe('2025-12-01');
  await expect.element(screen.getByRole('grid').nth(1)).toHaveAttribute('aria-label', '2026년 1월');
});

test('Previous and Next are ghost IconButtons that keep focus once the last month is reached', async () => {
  const months: Date[] = [];
  const screen = await render(
    <Calendar
      today={d(2026, 9, 15)}
      max={d(2026, 10, 31)}
      size="tiny"
      onMonthChange={(next) => months.push(next)}
    />,
  );
  const next = screen.getByRole('button', { name: '다음 달' });
  const node = next.element();
  await expect.element(next).toHaveAttribute('data-variant', 'ghost');
  await expect.element(next).toHaveAttribute('data-size', 'tiny');
  await expect.element(next).toHaveAttribute('type', 'button');
  await expect.element(next).not.toHaveAttribute('aria-disabled');
  await expect.element(next).not.toHaveAttribute('tabindex');
  node.focus();
  await userEvent.click(next);
  expect(months.map(dateKey)).toEqual(['2026-10-01']);
  expect(next.element()).toBe(node);
  await expect.element(next).toHaveAttribute('aria-disabled', 'true');
  await expect.element(next).not.toHaveAttribute('disabled');
  await expect.element(next).toHaveAttribute('data-disabled');
  await expect.element(next).toHaveAttribute('tabindex', '-1');
  await expect.element(next).toHaveFocus();
  await userEvent.click(next, { force: true });
  expect(months).toHaveLength(1);
  await userEvent.keyboard('{Enter}');
  expect(months).toHaveLength(1);
  await expect
    .element(screen.getByRole('button', { name: '이전 달' }))
    .not.toHaveAttribute('aria-disabled');
});

test('several months: Previous before the first grid only, Next after the last only', async () => {
  const screen = await render(<Calendar today={d(2026, 9, 15)} monthsToShow={3} />);
  const months = screen
    .getByRole('grid')
    .elements()
    .map((grid) => page.elementLocator(grid.parentElement!));
  expect(months).toHaveLength(3);
  await expect.element(months[0].getByRole('button', { name: '이전 달' })).toBeInTheDocument();
  await expect.element(months[0].getByRole('button', { name: '다음 달' })).not.toBeInTheDocument();
  await expect.element(months[2].getByRole('button', { name: '다음 달' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '다음 달' }));
  expect(
    screen
      .getByRole('status')
      .elements()
      .map((node) => node.textContent),
  ).toEqual(['2026년 10월', '2026년 11월', '2026년 12월']);
});

test('a controlled month waits for the parent', async () => {
  let month = null as Date | null;
  const screen = await render(
    <Calendar
      today={d(2026, 9, 15)}
      month={d(2026, 9, 1)}
      onMonthChange={(next) => (month = next)}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: '다음 달' }));
  expect(dateKey(month)).toBe('2026-10-01');
  await expect.element(day('2026-09-15')).toBeInTheDocument();
});

function EventDay(props: Calendar.DayButtonProps) {
  return (
    <Calendar.DayButton {...props}>
      {props.children}
      {props.modifiers.event && <span data-event-dot="" />}
    </Calendar.DayButton>
  );
}

test('parts: a DayButton built on Calendar.DayButton, modifiers, formatters and a footer', async () => {
  const screen = await render(
    <Calendar
      today={d(2026, 9, 15)}
      modifiers={{ event: [d(2026, 9, 4), d(2026, 9, 22)] }}
      modifiersClassNames={{ event: 'has-event' }}
      components={{ DayButton: EventDay }}
      formatters={{ formatDay: (date) => `${date.getDate()}일` }}
      footer="일정 2개"
    />,
  );
  expect(day('2026-09-04').querySelector('[data-event-dot]')).toBeInTheDocument();
  expect(day('2026-09-05').querySelector('[data-event-dot]')).toBeNull();
  expect(day('2026-09-22').parentElement).toHaveClass('has-event');
  expect(day('2026-09-05').firstChild?.textContent).toBe('5일');
  expect(day('2026-09-05')).toHaveClass('rounded-standard');
  expect(screen.getByRole('status').last().element().textContent).toBe('일정 2개');
});

test('root className and style accept a function of the calendar state; native props reach it', async () => {
  let pressed = '';
  const screen = await render(
    <Calendar
      today={d(2026, 9, 15)}
      defaultValue={d(2026, 9, 18)}
      id="schedule"
      aria-label="일정"
      onKeyDown={(event) => (pressed = event.key)}
      className={(state) => `month-${state.month.getMonth()}`}
      style={(state) => ({ outline: state.disabled ? '1px solid red' : undefined })}
    />,
  );
  const root = screen.getByRole('group', { name: '일정' });
  await expect.element(root).toHaveClass('month-8');
  expect(root.element().style.outline).toBe('');
  await expect.element(root).toHaveAttribute('id', 'schedule');
  day('2026-09-18').focus();
  await userEvent.keyboard('x');
  expect(pressed).toBe('x');
});
