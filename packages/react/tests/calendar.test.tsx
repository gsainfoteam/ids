import { BuddhistCalendar, CalendarDate, toCalendar } from '@internationalized/date';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Calendar } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const ssr = (props: Calendar.Props) => parse(renderToString(<Calendar {...props} />));
const d = (y: number, m: number, day: number) => new CalendarDate(y, m, day);
const dateKey = (date: CalendarDate | null | undefined) => date && date.toString();
const day = (key: string) =>
  document.querySelector<HTMLButtonElement>(`[data-calendar-day="${key}"]`)!;

test('SSR: Korean by default, two months without duplicate dates, one tab stop', () => {
  const doc = ssr({ defaultMonth: d(2024, 2, 1), today: d(2024, 2, 29), monthsToShow: 2 });
  const grids = doc.querySelectorAll('[role=grid]');
  expect(grids).toHaveLength(2);
  expect(grids[0].getAttribute('aria-label')).toBe('2024년 2월');
  expect(doc.querySelector('[data-calendar]')!.getAttribute('aria-label')).toBe('달력');
  expect(doc.querySelector('[data-calendar]')!.getAttribute('lang')).toBe('ko-KR');
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

test('any BCP 47 tag drives names, the first weekday and the day labels without an import', () => {
  const first = (props: Calendar.Props) =>
    ssr({ today: d(2026, 9, 15), ...props }).querySelector('th')!;
  expect(first({ locale: 'en-US' }).textContent).toBe('S');
  expect(first({ locale: 'en-US' }).getAttribute('aria-label')).toBe('Sunday');
  expect(first({ locale: 'de-DE' }).getAttribute('aria-label')).toBe('Montag');
  expect(first({ locale: 'fr-FR' }).getAttribute('aria-label')).toBe('lundi');
  expect(first({ locale: 'en-US-u-fw-mon' }).getAttribute('aria-label')).toBe('Monday');
  expect(first({ locale: 'de-DE', weekStartsOn: 0 }).getAttribute('aria-label')).toBe('Sonntag');
  expect(first({ weekStartsOn: 1 }).getAttribute('aria-label')).toBe('월요일');
  const labelOf = (props: Calendar.Props, key = '2026-09-15') =>
    ssr({ today: d(2026, 9, 14), ...props })
      .querySelector(`[data-calendar-day="${key}"]`)!
      .getAttribute('aria-label');
  expect(labelOf({ locale: 'en-US' })).toBe('Tuesday, September 15, 2026');
  expect(labelOf({ locale: 'en-US' }, '2026-09-14')).toBe('오늘, Monday, September 14, 2026');
  expect(labelOf({ locale: 'fr-FR' })).toBe('mardi 15 septembre 2026');
  const japanese = ssr({ locale: 'ja-JP', today: d(2026, 9, 15) });
  expect(japanese.querySelector('[data-calendar]')!.getAttribute('lang')).toBe('ja-JP');
  expect(japanese.querySelector('[role=grid]')!.getAttribute('aria-label')).toBe('2026年9月');
  expect(japanese.querySelector('[role=status]')!.textContent).toBe('2026年9月');
  expect(japanese.querySelector('th')!.getAttribute('aria-label')).toBe('日曜日');
  expect(japanese.querySelector('[data-calendar-day="2026-09-15"]')!.textContent).toBe('15');
  const french = ssr({ locale: 'fr-FR', today: d(2026, 9, 15) });
  expect(french.querySelector('[role=grid]')!.getAttribute('aria-label')).toBe('septembre 2026');
  expect(() => ssr({ locale: 'not a tag' })).toThrow(/BCP 47/);
});

test('numerals draw every number in the chosen system', () => {
  const arabic = ssr({
    locale: 'ar-EG',
    numerals: 'arab',
    showWeekNumber: true,
    today: d(2026, 9, 15),
  });
  expect(arabic.querySelector('[data-calendar-day="2026-09-15"]')!.textContent).toBe('١٥');
  expect(arabic.querySelector('[role=status]')!.textContent).toBe('سبتمبر ٢٠٢٦');
  expect(arabic.querySelector('[role=rowheader]')!.textContent).toMatch(/^[٠-٩]{2}$/);
  const latin = ssr({ locale: 'ar-EG', numerals: 'latn', today: d(2026, 9, 15) });
  expect(latin.querySelector('[data-calendar-day="2026-09-15"]')!.textContent).toBe('15');
  const devanagari = ssr({ numerals: 'deva', today: d(2026, 9, 15) });
  expect(devanagari.querySelector('[data-calendar-day="2026-09-15"]')!.textContent).toBe('१५');
});

test('grid, weekday and week number labels are Korean by default', () => {
  const doc = ssr({ today: d(2026, 9, 15), showWeekNumber: true });
  expect(doc.querySelector('[role=grid]')!.getAttribute('aria-label')).toBe('2026년 9월');
  expect(
    [...doc.querySelectorAll('th[scope=col]')].map((th) => th.getAttribute('aria-label')),
  ).toEqual(['주차', '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']);
  expect(doc.querySelector('[role=rowheader]')!.getAttribute('aria-label')).toMatch(/^\d+주차$/);
});

test('diagnostics for mismatched values, limits and parts outside the calendar', () => {
  // @ts-expect-error A range takes { start, end }, not a date.
  expect(() => ssr({ selectionMode: 'range', value: d(2026, 1, 1) })).toThrow(/range requires/);
  expect(() => ssr({ min: d(2026, 2, 1), max: d(2026, 1, 1) })).toThrow(/min <= max/);
  expect(() => ssr({ monthsToShow: 0 })).toThrow(/monthsToShow/);
  // @ts-expect-error A week starts on 0 to 6.
  expect(() => ssr({ weekStartsOn: 7 })).toThrow(/weekStartsOn/);
  // @ts-expect-error The react-day-picker parts are no longer public.
  expect(Calendar.DayButton).toBeUndefined();
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

test('single: blocked days refuse, the value is a CalendarDate, a re-click is no change', async () => {
  const changes: (CalendarDate | null)[] = [];
  await render(
    <Calendar
      today={d(2026, 9, 15)}
      min={d(2026, 9, 10)}
      max={d(2026, 9, 20)}
      disabled={(date) => date.day === 16}
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
  expect(changes[0]).toBeInstanceOf(CalendarDate);
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
  let value = null as CalendarDate | null;
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
  let value: CalendarDate[] = [];
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
  const months: CalendarDate[] = [];
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
  const months: CalendarDate[] = [];
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
  const months: CalendarDate[] = [];
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
  let month = null as CalendarDate | null;
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

test('renderDay replaces only the content and gets the day state; modifiers and a footer', async () => {
  const states: Record<string, Calendar.DayState> = {};
  const screen = await render(
    <Calendar
      selectionMode="range"
      today={d(2026, 9, 15)}
      defaultValue={{ start: d(2026, 9, 21), end: d(2026, 9, 23) }}
      disabled={d(2026, 9, 5)}
      modifiers={{ event: [d(2026, 9, 4), d(2026, 9, 22)], weekend: { dayOfWeek: [0, 6] } }}
      modifiersClassNames={{ event: 'has-event' }}
      renderDay={(date, state) => {
        states[date.toString()] = state;
        return (
          <>
            {`${date.day}일`}
            {state.modifiers.event && <span data-event-dot="" />}
          </>
        );
      }}
      footer="일정 2개"
    />,
  );
  expect(day('2026-09-04').querySelector('[data-event-dot]')).toBeInTheDocument();
  expect(day('2026-09-06').querySelector('[data-event-dot]')).toBeNull();
  expect(day('2026-09-22').parentElement).toHaveClass('has-event');
  expect(day('2026-09-06').textContent).toBe('6일');
  expect(day('2026-09-06')).toHaveClass('rounded-standard');
  expect(day('2026-09-22')).toHaveAttribute('data-range-middle');
  expect(day('2026-09-22')).toHaveAttribute('aria-label', '2026년 9월 22일 화요일, 선택됨');
  expect(states['2026-09-04'].modifiers).toEqual({ event: true, weekend: false });
  expect(states['2026-09-05']).toMatchObject({ disabled: true, modifiers: { weekend: true } });
  expect(states['2026-09-15']).toMatchObject({ today: true, selected: false });
  expect(states['2026-09-21']).toMatchObject({ selected: true, rangeStart: true });
  expect(states['2026-09-22']).toMatchObject({ rangeMiddle: true, modifiers: { event: true } });
  expect(states['2026-09-23']).toMatchObject({ rangeEnd: true, rangeStart: false });
  expect(states['2026-08-30']).toMatchObject({ outside: true });
  expect(screen.getByRole('status').last().element().textContent).toBe('일정 2개');
  await userEvent.click(day('2026-09-10'));
  await expect.element(day('2026-09-10')).toHaveAttribute('data-selected');
  expect(states['2026-09-10'].selected).toBe(true);
});

test('every DateMatcher form blocks the days it names', () => {
  const blocked = (disabled: Calendar.Props['disabled']) =>
    [...ssr({ today: d(2026, 9, 15), disabled }).querySelectorAll('[data-calendar-day][disabled]')]
      .map((node) => node.getAttribute('data-calendar-day'))
      .filter((key) => key!.startsWith('2026-09'));
  expect(blocked(d(2026, 9, 9))).toEqual(['2026-09-09']);
  expect(blocked([d(2026, 9, 9), d(2026, 9, 11)])).toEqual(['2026-09-09', '2026-09-11']);
  expect(blocked({ start: d(2026, 9, 28), end: d(2026, 9, 30) })).toEqual([
    '2026-09-28',
    '2026-09-29',
    '2026-09-30',
  ]);
  expect(blocked({ before: d(2026, 9, 3) })).toEqual(['2026-09-01', '2026-09-02']);
  expect(blocked({ after: d(2026, 9, 28) })).toEqual(['2026-09-29', '2026-09-30']);
  expect(blocked({ after: d(2026, 9, 9), before: d(2026, 9, 12) })).toEqual([
    '2026-09-10',
    '2026-09-11',
  ]);
  expect(blocked({ dayOfWeek: 0 })).toEqual([
    '2026-09-06',
    '2026-09-13',
    '2026-09-20',
    '2026-09-27',
  ]);
  expect(blocked({ dayOfWeek: [2] })).toEqual([
    '2026-09-01',
    '2026-09-08',
    '2026-09-15',
    '2026-09-22',
    '2026-09-29',
  ]);
  expect(blocked((date) => date.day % 10 === 0)).toEqual([
    '2026-09-10',
    '2026-09-20',
    '2026-09-30',
  ]);
  expect(blocked(false)).toEqual([]);
  expect(blocked(true)).toHaveLength(30);
  expect(blocked([{ before: d(2026, 9, 2) }, d(2026, 9, 30), [d(2026, 9, 15)]])).toEqual([
    '2026-09-01',
    '2026-09-15',
    '2026-09-30',
  ]);
});

test('values are checked by shape: a lookalike passes, a Date or another calendar throws', () => {
  const lookalike = {
    calendar: { identifier: 'gregory' },
    era: 'AD',
    year: 2026,
    month: 9,
    day: 18,
    compare: () => 0,
  } as unknown as CalendarDate;
  const doc = ssr({ today: d(2026, 9, 15), value: lookalike, min: lookalike });
  expect(doc.querySelector('[data-calendar-day="2026-09-18"]')!.hasAttribute('data-selected')).toBe(
    true,
  );
  expect(doc.querySelector('[data-calendar-day="2026-09-17"]')!.hasAttribute('disabled')).toBe(
    true,
  );
  // @ts-expect-error A Date is no longer a calendar value.
  expect(() => ssr({ value: new Date(2026, 8, 18) })).toThrow(/expected a CalendarDate/);
  // @ts-expect-error today takes a CalendarDate.
  expect(() => ssr({ today: '2026-09-15' })).toThrow(/expected a CalendarDate/);
  const buddhist = toCalendar(d(2026, 9, 18), new BuddhistCalendar());
  expect(() => ssr({ value: buddhist })).toThrow(/toCalendar\(date, new GregorianCalendar\(\)\)/);
  expect(() => ssr({ selectionMode: 'multiple', value: [d(2026, 9, 1), buddhist] })).toThrow(
    /only gregorian/,
  );
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
      className={(state) => `month-${state.month.month}`}
      style={(state) => ({ outline: state.disabled ? '1px solid red' : undefined })}
    />,
  );
  const root = screen.getByRole('group', { name: '일정' });
  await expect.element(root).toHaveClass('month-9');
  expect(root.element().style.outline).toBe('');
  await expect.element(root).toHaveAttribute('id', 'schedule');
  day('2026-09-18').focus();
  await userEvent.keyboard('x');
  expect(pressed).toBe('x');
});
