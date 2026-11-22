import { useState } from 'react';

import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import axe from 'axe-core';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { cdp, page, server, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider, Menu, Scheduler } from '../src';
import { skipWithoutCdp } from './engines';
import { testTheme } from './theme';
import {
  allDayBarsIn,
  daysOf,
  hiddenOn,
  monthBarsIn,
  shownDayCount,
  stepOf,
  timedSegmentsOn,
} from '../src/components/data/scheduler/layout';

afterEach(() => {
  vi.useRealTimers();
});

const at = (day: number, hour: number, minute = 0) =>
  new CalendarDateTime(2026, 11, day, hour, minute);
const on = (day: number) => new CalendarDate(2026, 11, day);

const NOW = at(17, 10, 30);

const WALL_CLOCK = 'UTC';
const weekRange = (from: CalendarDate, to: CalendarDate, locale = 'ko-KR') =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: WALL_CLOCK,
  }).formatRange(from.toDate(WALL_CLOCK), to.toDate(WALL_CLOCK));

const EVENTS: Scheduler.EventData[] = [
  { id: 'algo', title: 'Algorithms', start: at(17, 9), end: at(17, 10, 30) },
  { id: 'room', title: 'Study room', start: at(17, 10), end: at(17, 12) },
  { id: 'lunch', title: 'Lunch', start: at(17, 12), end: at(17, 13) },
  { id: 'late', title: 'Deadline', start: at(19, 23), end: at(20, 1) },
  { id: 'fest', title: 'Festival', start: on(19), end: on(20), allDay: true },
];

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const inProvider = (props: Partial<Scheduler.Props>) => (
  <IdsProvider theme={testTheme}>
    <Scheduler events={EVENTS} defaultDate={on(17)} now={NOW} {...props} />
  </IdsProvider>
);

const nameOf = (doc: Document, element: Element) =>
  (element.getAttribute('aria-labelledby') ?? '')
    .split(' ')
    .map((id) => {
      const labelling = doc.getElementById(id)!.cloneNode(true) as Element;
      labelling.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
      return labelling.textContent;
    })
    .join(' ');

test('SSR: a labelled group, one named section per day and the events as list items with times', () => {
  const doc = parse(renderToString(inProvider({})));
  const root = doc.querySelector('[data-scheduler]')!;
  expect(root.getAttribute('role')).toBe('group');
  expect(root.getAttribute('aria-label')).toBe('일정표');
  expect(root.getAttribute('lang')).toBe('ko-KR');

  const sections = [...doc.querySelectorAll('section[aria-labelledby]')];
  expect(sections.map((section) => section.getAttribute('data-scheduler-column'))).toEqual([
    '2026-11-15',
    '2026-11-16',
    '2026-11-17',
    '2026-11-18',
    '2026-11-19',
    '2026-11-20',
    '2026-11-21',
  ]);
  expect(nameOf(doc, sections[2])).toContain('2026년 11월 17일 화요일');

  const today = doc.querySelector('[aria-current="date"]')!;
  expect(today.getAttribute('data-scheduler-day')).toBe('2026-11-17');

  const algo = doc.querySelector('[data-scheduler-event="algo"]')!;
  expect(algo.closest('li')!.parentElement!.tagName).toBe('UL');
  expect(algo.closest('section')!.getAttribute('data-scheduler-column')).toBe('2026-11-17');
  expect([...algo.querySelectorAll('time')].map((time) => time.getAttribute('datetime'))).toEqual([
    '2026-11-17T09:00:00',
    '2026-11-17T10:30:00',
  ]);

  const now = doc.querySelector('[data-scheduler-now]')!;
  expect(now.tagName).toBe('HR');
  expect(now.getAttribute('aria-hidden')).toBe('true');
  expect(now.closest('section')!.getAttribute('data-scheduler-column')).toBe('2026-11-17');

  const festival = doc.querySelectorAll('[data-scheduler-event="fest"]');
  expect(festival).toHaveLength(1);
  expect(nameOf(doc, festival[0].closest('ul')!)).toBe('종일');
  expect(festival[0].querySelector('[data-item-description]')!.textContent).toBe(
    new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: WALL_CLOCK,
    }).formatRange(on(19).toDate(WALL_CLOCK), on(20).toDate(WALL_CLOCK)),
  );
  expect(doc.querySelectorAll('[data-scheduler-event="late"]')).toHaveLength(2);
});

test('SSR without `now` draws no time line, so the server and the first client render agree', () => {
  const doc = parse(renderToString(inProvider({ now: undefined })));
  expect(doc.querySelector('[data-scheduler-now]')).toBeNull();
});

test('the client clock draws the time line after hydration', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 17, 14, 15));
  const screen = await render(inProvider({ now: undefined, defaultDate: undefined }));
  await expect
    .element(screen.getByRole('region', { name: '2026년 11월 17일 화요일' }))
    .toBeInTheDocument();
  const line = document.querySelector<HTMLElement>('[data-scheduler-now]')!;
  expect(line.closest('section')!.getAttribute('data-scheduler-column')).toBe('2026-11-17');
  expect(line.style.getPropertyValue('--scheduler-now')).toBe('14.25');
});

test('a server on another date marks no day as today, and hydration marks the client day', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 17, 23, 30));
  const tree = inProvider({ now: undefined });
  const container = document.createElement('div');
  container.innerHTML = renderToString(tree);
  document.body.append(container);
  expect(container.querySelector('[aria-current="date"]')).toBeNull();

  vi.setSystemTime(new Date(2026, 10, 18, 8, 30));
  const recovered = vi.fn();
  const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
  const root = hydrateRoot(container, tree, { onRecoverableError: recovered });

  await expect
    .poll(() =>
      container.querySelector('[aria-current="date"]')?.getAttribute('data-scheduler-day'),
    )
    .toBe('2026-11-18');
  expect(recovered).not.toHaveBeenCalled();
  expect(logged).not.toHaveBeenCalled();

  root.unmount();
  container.remove();
  logged.mockRestore();
});

test('overlapping events share the column side by side, and each widens into the columns free beside it', () => {
  const place = (segments: ReturnType<typeof timedSegmentsOn>) =>
    segments.map(({ event, left, width }) => [event.id, left, width]);

  expect(place(timedSegmentsOn(EVENTS, on(17)))).toEqual([
    ['algo', 0, 0.5],
    ['room', 0.5, 0.5],
    ['lunch', 0, 1],
  ]);

  const together = [
    { id: 'a', title: 'A', start: at(18, 9), end: at(18, 11) },
    { id: 'b', title: 'B', start: at(18, 9), end: at(18, 10) },
    { id: 'c', title: 'C', start: at(18, 9, 30), end: at(18, 10) },
    { id: 'd', title: 'D', start: at(18, 10), end: at(18, 11) },
  ];
  expect(place(timedSegmentsOn(together, on(18)))).toEqual([
    ['a', 0, 1 / 3],
    ['b', 1 / 3, 1 / 3],
    ['c', 2 / 3, 1 / 3],
    ['d', 1 / 3, 2 / 3],
  ]);

  const thursday = timedSegmentsOn(EVENTS, on(19))[0];
  const friday = timedSegmentsOn(EVENTS, on(20))[0];
  expect([thursday.startHour, thursday.hours]).toEqual([23, 1]);
  expect([friday.startHour, friday.hours]).toEqual([0, 1]);

  const instant = timedSegmentsOn(
    [{ id: 'ping', title: 'Ping', start: at(18, 8), end: at(18, 8) }],
    on(18),
  );
  expect(instant[0].hours).toBe(0.5);
});

const FIREFOX_STOPS_ON_EVERY_SCROLLER = server.browser === 'firefox';
const GRID_VIEWPORT = 'the grid viewport';
const stopName = (element: HTMLElement) =>
  element.hasAttribute('data-scroll-area-viewport')
    ? GRID_VIEWPORT
    : (element.getAttribute('aria-label') ?? element.textContent ?? '');

test('keyboard: Tab walks the toolbar and the event buttons in day and time order', async () => {
  const opened = vi.fn();
  const screen = await render(
    inProvider({
      children: (event) => <Scheduler.Event onClick={() => opened(event.id)} />,
    }),
  );

  const gridStop = FIREFOX_STOPS_ON_EVERY_SCROLLER ? [GRID_VIEWPORT] : [];
  const expected = [
    '이전 주',
    '오늘',
    '다음 주',
    weekRange(on(15), on(21)),
    '주',
    ...gridStop,
    'Festival',
    'Algorithms',
    'Study room',
    'Lunch',
    'Deadline',
  ];

  const stops: string[] = [];
  for (let index = 0; index < expected.length; index += 1) {
    await userEvent.keyboard('{Tab}');
    stops.push(stopName(document.activeElement as HTMLElement));
  }
  expect(stops).toEqual(expected);

  await userEvent.keyboard('{Enter}');
  expect(opened).toHaveBeenLastCalledWith('late');

  await userEvent.keyboard(`{Shift>}${'{Tab}'.repeat(7 + gridStop.length)}{/Shift}`);
  await expect.element(screen.getByRole('button', { name: '다음 주' })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect
    .element(screen.getByRole('region', { name: '2026년 11월 24일 화요일' }))
    .toBeInTheDocument();
  await expect.element(screen.getByRole('status')).toHaveTextContent(weekRange(on(22), on(28)));
});

test('keyboard: the date button opens a calendar on the shown date, and Escape hands focus back', async () => {
  const onDateChange = vi.fn();
  const screen = await render(inProvider({ onDateChange }));
  const trigger = screen.getByRole('button', { name: weekRange(on(15), on(21)) });

  await userEvent.click(trigger);
  await expect
    .poll(() => (document.activeElement as HTMLElement).dataset.calendarDay)
    .toBe('2026-11-17');
  await userEvent.keyboard('{Escape}');
  await expect.element(trigger).toHaveFocus();
  expect(onDateChange).not.toHaveBeenCalled();

  await userEvent.keyboard('{Enter}');
  await expect
    .poll(() => (document.activeElement as HTMLElement).dataset.calendarDay)
    .toBe('2026-11-17');
  await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{Enter}');
  expect(onDateChange).toHaveBeenLastCalledWith(on(22));
  await expect.poll(() => document.querySelector('[data-calendar]')).toBeNull();
  await expect
    .element(screen.getByRole('button', { name: weekRange(on(22), on(28)) }))
    .toBeInTheDocument();
});

test('axe finds nothing with the date picker open', async () => {
  const screen = await render(inProvider({}));
  await userEvent.click(screen.getByRole('button', { name: weekRange(on(15), on(21)) }));
  await expect.poll(() => document.querySelector('[data-calendar]')).not.toBeNull();

  const { violations } = await axe.run(
    { include: [document.body], exclude: [['[data-floating-ui-focus-guard]']] },
    {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
      },
      rules: { 'color-contrast': { enabled: false } },
    },
  );
  expect(violations.map((violation) => violation.id)).toEqual([]);
});

test('at 414px the week scrolls inside its board, and the page itself does not scroll sideways', async () => {
  await page.viewport(414, 896);
  const screen = await render(inProvider({}));
  await expect
    .element(screen.getByRole('region', { name: '2026년 11월 17일 화요일' }))
    .toBeInTheDocument();

  const viewport = document.querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
  expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(414);
  for (const section of document.querySelectorAll('section'))
    expect(section.getBoundingClientRect().width).toBeGreaterThanOrEqual(87);

  const corner = document.querySelector<HTMLElement>('[data-scroll-area-viewport] [aria-hidden]')!;
  const cornerLeft = corner.getBoundingClientRect().left;
  viewport.scrollLeft = 200;
  await expect.poll(() => viewport.scrollLeft).toBe(200);
  expect(
    document
      .querySelector<HTMLElement>('[data-scroll-area-viewport] > div > div:last-child > div')!
      .getBoundingClientRect().left,
  ).toBe(cornerLeft);

  await userEvent.click(screen.getByRole('radio', { name: '일' }));
  await expect.poll(() => document.querySelectorAll('section')).toHaveLength(1);
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

test('the grid opens a quarter hour above the first event of the range, or above 08:00 when that comes first', async () => {
  await render(inProvider({ events: [EVENTS[3]] }));
  const viewport = document.querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
  const hour = document.querySelector('section')!.getBoundingClientRect().height / 24;
  await expect.poll(() => Math.round(viewport.scrollTop)).toBe(Math.round(hour * 7.75));
});

test('all-day events become one bar across their days, clipped to the range and packed into rows', () => {
  const bars = allDayBarsIn(
    [
      ...EVENTS,
      { id: 'trip', title: 'Trip', start: on(12), end: on(16), allDay: true },
      { id: 'exam', title: 'Exam', start: on(20), end: on(25), allDay: true },
      { id: 'later', title: 'Later', start: on(23), end: on(23), allDay: true },
    ],
    [15, 16, 17, 18, 19, 20, 21].map(on),
  );
  expect(bars.map(({ event, column, span, row }) => [event.id, column, span, row])).toEqual([
    ['trip', 0, 2, 0],
    ['fest', 4, 2, 0],
    ['exam', 5, 2, 1],
  ]);
});

test('month shows whole weeks from the week of the 1st to the week of the last day', () => {
  const sundays = daysOf('month', on(17), 0);
  expect(sundays).toHaveLength(35);
  expect([sundays[0].toString(), sundays.at(-1)!.toString()]).toEqual(['2026-11-01', '2026-12-05']);

  const mondays = daysOf('month', on(17), 1);
  expect(mondays).toHaveLength(42);
  expect([mondays[0].toString(), mondays.at(-1)!.toString()]).toEqual(['2026-10-26', '2026-12-06']);
});

test('days shows dayCount days from the date and steps by them', () => {
  expect(daysOf('days', on(17), 0, 4).map(String)).toEqual([
    '2026-11-17',
    '2026-11-18',
    '2026-11-19',
    '2026-11-20',
  ]);
  expect(stepOf('days', 4)).toEqual({ days: 4 });
  expect([0, 2.4, 9, 30, Number.NaN].map(shownDayCount)).toEqual([2, 2, 9, 14, 3]);
  expect(stepOf('month')).toEqual({ months: 1 });
});

test('a month week packs all-day and timed events into rows, long bars first, and counts the rest', () => {
  const week = [15, 16, 17, 18, 19, 20, 21].map(on);
  const bars = monthBarsIn(
    [
      ...EVENTS,
      { id: 'midnight', title: 'Midnight', start: at(18, 22), end: at(19, 0) },
      { id: 'trip', title: 'Trip', start: on(12), end: on(16), allDay: true },
    ],
    week,
  );
  expect(bars.map(({ event, column, span, row }) => [event.id, column, span, row])).toEqual([
    ['trip', 0, 2, 0],
    ['algo', 2, 1, 0],
    ['room', 2, 1, 1],
    ['lunch', 2, 1, 2],
    ['midnight', 3, 1, 0],
    ['fest', 4, 2, 0],
    ['late', 4, 2, 1],
  ]);
  expect(hiddenOn(bars, 2, 2)).toBe(1);
  expect(hiddenOn(bars, 2, 3)).toBe(0);
});

test('a bar longer than a week wraps onto the next week with flat ends where it is cut', async () => {
  const trip = {
    id: 'trip',
    title: 'Trip',
    start: on(26),
    end: new CalendarDate(2026, 12, 4),
    allDay: true,
  };
  const weeks = [
    [22, 23, 24, 25, 26, 27, 28].map(on),
    [on(29), on(30), ...[1, 2, 3, 4, 5].map((day) => new CalendarDate(2026, 12, day))],
  ];
  const cut = weeks.map((week) =>
    monthBarsIn([trip], week).map(({ column, span, fromBefore, pastEnd }) => [
      column,
      span,
      fromBefore,
      pastEnd,
    ]),
  );
  expect(cut).toEqual([[[4, 3, false, true]], [[0, 6, true, false]]]);

  const screen = await render(inProvider({ defaultView: 'month', events: [...EVENTS, trip] }));
  await expect.element(screen.getByText('Trip').first()).toBeVisible();
  const [first, second] = document.querySelectorAll<HTMLElement>('[data-scheduler-event="trip"]');
  expect(getComputedStyle(first).borderEndEndRadius).toBe('0px');
  expect(getComputedStyle(first).borderStartStartRadius).not.toBe('0px');
  expect(getComputedStyle(second).borderStartStartRadius).toBe('0px');
  expect(getComputedStyle(second).borderEndEndRadius).not.toBe('0px');
});

test('in month view a one-day timed event is a dotted line without a fill, and an all-day one a filled bar', async () => {
  const screen = await render(inProvider({ defaultView: 'month' }));
  await expect.element(screen.getByText('Algorithms')).toBeVisible();
  const timed = document.querySelector<HTMLElement>('[data-scheduler-event="algo"]')!;
  const allDay = document.querySelector<HTMLElement>('[data-scheduler-event="fest"]')!;
  const overnight = document.querySelector<HTMLElement>('[data-scheduler-event="late"]')!;
  expect(getComputedStyle(timed).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(getComputedStyle(allDay).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(getComputedStyle(overnight).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
});

test('a right-click on an empty month day hands slotMenu the whole day', async () => {
  const slotMenu = vi.fn((slot: Scheduler.Slot) => (
    <Menu.Item>Create on {slot.start.day}</Menu.Item>
  ));
  const screen = await render(inProvider({ defaultView: 'month', slotMenu }));
  await expect.element(screen.getByText('Algorithms')).toBeInTheDocument();
  const day = document.querySelector<HTMLElement>('[data-scheduler-month-day="2026-11-25"]')!;

  await userEvent.click(day, { button: 'right', position: { x: 40, y: 60 } });

  await expect.element(screen.getByRole('menu', { name: '2026년 11월 25일 수요일' })).toBeVisible();
  const [slot] = slotMenu.mock.lastCall!;
  expect(slot.start.toString()).toBe('2026-11-25T00:00:00');
  expect(slot.end.toString()).toBe('2026-11-26T00:00:00');
});

test('month events read as one line with their start, and add no Tab stop without onEventChange', async () => {
  const screen = await render(inProvider({ defaultView: 'month' }));
  await expect.element(screen.getByText('Algorithms')).toBeVisible();
  const algo = document.querySelector('[data-scheduler-event="algo"]')!;
  expect(algo.textContent).toContain('오전 9:00');
  expect(algo.getAttribute('tabindex')).toBeNull();
  expect(document.querySelector('[data-resizable-handle]')).toBeNull();
});

test('keyboard: in month view Space picks an event up, the arrows move it by days and weeks, Enter drops it', async () => {
  const onEventChange = vi.fn();
  const screen = await render(inProvider({ defaultView: 'month', onEventChange }));
  await expect.element(screen.getByText('Festival')).toBeVisible();
  expect(document.querySelector('[data-resizable-handle]')).toBeNull();

  document.querySelector<HTMLElement>('[data-scheduler-event="fest"]')!.focus();
  await userEvent.keyboard('[Space]{ArrowRight}{ArrowDown}{Enter}');
  await vi.waitFor(() => expect(onEventChange).toHaveBeenCalledTimes(1));
  const [festival, moved] = onEventChange.mock.calls[0]!;
  expect(festival.id).toBe('fest');
  expect(moved.start.toString()).toBe('2026-11-27');
  expect(moved.end.toString()).toBe('2026-11-28');

  document.querySelector<HTMLElement>('[data-scheduler-event="algo"]')!.focus();
  await userEvent.keyboard('[Space]{ArrowLeft}{ArrowUp}{Escape}');
  expect(onEventChange).toHaveBeenCalledTimes(1);
  await userEvent.keyboard('[Space]{ArrowLeft}{Enter}');
  await vi.waitFor(() => expect(onEventChange).toHaveBeenCalledTimes(2));
  const [, shifted] = onEventChange.mock.calls[1]!;
  expect(shifted.start.toString()).toBe('2026-11-16T09:00:00');
  expect(shifted.end.toString()).toBe('2026-11-16T10:30:00');
});

test('locale names the days and times, and picks the first weekday', () => {
  const doc = parse(renderToString(inProvider({ locale: 'de-DE' })));
  expect(doc.querySelector('[data-scheduler-day]')!.getAttribute('data-scheduler-day')).toBe(
    '2026-11-16',
  );
  expect(doc.querySelector('[data-scheduler-range]')!.textContent).toBe(
    weekRange(on(16), on(22), 'de-DE'),
  );
  expect(doc.querySelector('[data-scheduler-event="algo"] time')!.textContent).toBe(
    new Intl.DateTimeFormat('de-DE', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: WALL_CLOCK,
    }).format(at(17, 9).toDate(WALL_CLOCK)),
  );
  const english = parse(renderToString(inProvider({ locale: 'en-US', defaultView: 'day' })));
  expect(english.querySelector('[data-scheduler-range]')!.textContent).toBe(
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      timeZone: WALL_CLOCK,
    }).format(on(17).toDate(WALL_CLOCK)),
  );
});

const frameOffset = (x: number, y: number) => {
  const frame = window.frameElement?.getBoundingClientRect() ?? {
    left: 0,
    top: 0,
    width: innerWidth,
  };
  const scale = frame.width / window.innerWidth;
  return { x: frame.left + x * scale, y: frame.top + y * scale };
};

async function mouse(type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', x: number, y: number) {
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    ...frameOffset(x, y),
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
  });
}

async function dragBy(element: Element, x: number, y: number) {
  const { left, top, width, height } = element.getBoundingClientRect();
  const from = { x: left + width / 2, y: top + height / 2 };

  await mouse('mousePressed', from.x, from.y);
  for (let step = 1; step <= 8; step++)
    await mouse('mouseMoved', from.x + (x * step) / 8, from.y + (y * step) / 8);
  await new Promise(requestAnimationFrame);
  await mouse('mouseReleased', from.x + x, from.y + y);
}

test('without `onEventChange` the events have no end handle and add no Tab stop', async () => {
  const screen = await render(inProvider({}));
  await expect.element(screen.getByText('Algorithms')).toBeInTheDocument();
  expect(document.querySelector('[data-scheduler] [role="separator"]')).toBeNull();
  expect(document.querySelector('[data-scheduler-event][tabindex]')).toBeNull();
});

test('pointer: dragging an event moves it by whole days and quarter hours, and the drop does not click it', async (context) => {
  skipWithoutCdp(context);
  const onEventChange = vi.fn();
  const onClick = vi.fn();
  const screen = await render(
    inProvider({
      onEventChange,
      children: () => <Scheduler.Event onClick={onClick} />,
    }),
  );
  const title = screen.getByRole('button', { name: 'Algorithms' });
  await expect.element(title).toBeInTheDocument();
  const column = title.element().closest('[data-scheduler-column]')!;
  const hour = column.getBoundingClientRect().height / 24;

  await dragBy(title.element(), -column.getBoundingClientRect().width, hour + 4);

  await vi.waitFor(() => expect(onEventChange).toHaveBeenCalledTimes(1));
  const [event, change] = onEventChange.mock.calls[0]!;
  expect(event.id).toBe('algo');
  expect(change.start.toString()).toBe('2026-11-16T10:00:00');
  expect(change.end.toString()).toBe('2026-11-16T11:30:00');
  expect(onClick).not.toHaveBeenCalled();
});

test('pointer: a month event dragged onto another day keeps its time and moves by whole days', async (context) => {
  skipWithoutCdp(context);
  const onEventChange = vi.fn();
  const screen = await render(inProvider({ defaultView: 'month', onEventChange }));
  await expect.element(screen.getByText('Algorithms')).toBeVisible();
  const algo = document.querySelector('[data-scheduler-event="algo"]')!.getBoundingClientRect();
  const target = document
    .querySelector('[data-scheduler-month-day="2026-11-25"]')!
    .getBoundingClientRect();
  const from = { x: algo.left + 12, y: algo.top + algo.height / 2 };
  const to = { x: target.left + target.width / 2, y: target.top + target.height / 2 };

  await mouse('mousePressed', from.x, from.y);
  for (let step = 1; step <= 8; step++)
    await mouse(
      'mouseMoved',
      from.x + ((to.x - from.x) * step) / 8,
      from.y + ((to.y - from.y) * step) / 8,
    );
  await new Promise(requestAnimationFrame);
  const lifted = document.querySelector('[data-scheduler-event="algo"]')!.getBoundingClientRect();
  expect(
    Math.abs(
      lifted.left -
        algo.left -
        (target.left -
          document.querySelector('[data-scheduler-month-day="2026-11-17"]')!.getBoundingClientRect()
            .left),
    ),
  ).toBeLessThan(1);
  await mouse('mouseReleased', to.x, to.y);

  await vi.waitFor(() => expect(onEventChange).toHaveBeenCalledTimes(1));
  const [, change] = onEventChange.mock.calls[0]!;
  expect(change.start.toString()).toBe('2026-11-25T09:00:00');
  expect(change.end.toString()).toBe('2026-11-25T10:30:00');
});

test('pointer: a dropped event takes focus, the same as a keyboard drop', async (context) => {
  skipWithoutCdp(context);
  function Moving() {
    const [events, setEvents] = useState(EVENTS);
    return (
      <IdsProvider theme={testTheme}>
        <Scheduler
          events={events}
          defaultDate={on(17)}
          defaultView="month"
          now={NOW}
          onEventChange={(event, change) =>
            setEvents((all) => all.map((each) => (each.id === event.id ? { ...each, ...change } : each)))
          }
        />
      </IdsProvider>
    );
  }
  const screen = await render(<Moving />);
  await expect.element(screen.getByText('Algorithms')).toBeVisible();
  const algo = document.querySelector('[data-scheduler-event="algo"]')!.getBoundingClientRect();
  const target = document
    .querySelector('[data-scheduler-month-day="2026-11-25"]')!
    .getBoundingClientRect();
  const from = { x: algo.left + 12, y: algo.top + algo.height / 2 };
  const to = { x: target.left + target.width / 2, y: target.top + target.height / 2 };

  await mouse('mousePressed', from.x, from.y);
  for (let step = 1; step <= 8; step++)
    await mouse(
      'mouseMoved',
      from.x + ((to.x - from.x) * step) / 8,
      from.y + ((to.y - from.y) * step) / 8,
    );
  await mouse('mouseReleased', to.x, to.y);

  await expect
    .poll(() => document.activeElement?.closest('[data-scheduler-slot]')?.getAttribute('data-scheduler-slot'))
    .toBe('algo');
});

test('pointer: dragging over empty time selects quarter hours, and a plain press selects nothing', async (context) => {
  skipWithoutCdp(context);
  const onSlotSelect = vi.fn();
  const screen = await render(inProvider({ onSlotSelect }));
  await expect.element(screen.getByText('Algorithms')).toBeInTheDocument();
  const column = document.querySelector('[data-scheduler-column="2026-11-18"]')!;
  const viewport = column.closest<HTMLElement>('[data-scroll-area-viewport]')!;
  const outside = viewport.getBoundingClientRect();
  const before = column.getBoundingClientRect();
  const hour = before.height / 24;
  viewport.scrollBy({
    left: before.left + before.width / 2 - (outside.left + outside.width / 2),
    top: before.top + hour * 14.85 - (outside.top + outside.height / 2),
    behavior: 'instant',
  });
  const { left, top } = column.getBoundingClientRect();
  const x = left + 8;

  await mouse('mousePressed', x, top + hour * 14.1);
  await mouse('mouseReleased', x, top + hour * 14.1);
  expect(onSlotSelect).not.toHaveBeenCalled();

  await mouse('mousePressed', x, top + hour * 14.1);
  await mouse('mouseMoved', x, top + hour * 15);
  await mouse('mouseMoved', x, top + hour * 15.6);
  await expect
    .poll(() => document.querySelector('[data-scheduler-selection]')?.textContent)
    .toBe('오후 2:00 – 오후 3:45');
  await mouse('mouseReleased', x, top + hour * 15.6);

  expect(onSlotSelect).toHaveBeenCalledTimes(1);
  const [slot] = onSlotSelect.mock.calls[0]!;
  expect(slot.start.toString()).toBe('2026-11-18T14:00:00');
  expect(slot.end.toString()).toBe('2026-11-18T15:45:00');
  expect(slot.allDay).toBe(false);
  expect(document.querySelector('[data-scheduler-selection]')).toBeNull();
});

test('pointer: a selection dragged past the board edge follows the scroll and ends under the pointer', async (context) => {
  skipWithoutCdp(context);
  const onSlotSelect = vi.fn();
  const screen = await render(inProvider({ onSlotSelect }));
  await expect.element(screen.getByText('Algorithms')).toBeInTheDocument();
  const column = document.querySelector('[data-scheduler-column="2026-11-18"]')!;
  const viewport = column.closest<HTMLElement>('[data-scroll-area-viewport]')!;
  const outside = viewport.getBoundingClientRect();
  const before = column.getBoundingClientRect();
  const hour = before.height / 24;
  viewport.scrollBy({
    left: before.left + before.width / 2 - (outside.left + outside.width / 2),
    top: before.top + hour * 13 - (outside.top + outside.height / 2),
    behavior: 'instant',
  });
  const x = column.getBoundingClientRect().left + 8;
  const middle = outside.top + outside.height / 2;
  const scrolledFrom = viewport.scrollTop;

  await mouse('mousePressed', x, middle);
  await mouse('mouseMoved', x, middle + hour);
  await mouse('mouseMoved', x, outside.bottom - 4);
  await expect.poll(() => viewport.scrollTop - scrolledFrom).toBeGreaterThan(hour * 2);
  await mouse('mouseMoved', x, middle);
  await mouse('mouseMoved', x, middle + hour);
  const scrolledTo = viewport.scrollTop;
  await mouse('mouseReleased', x, middle + hour);

  expect(viewport.scrollTop).toBe(scrolledTo);
  const pointerMinutes = ((middle + hour - column.getBoundingClientRect().top) / hour) * 60;
  expect(onSlotSelect).toHaveBeenCalledTimes(1);
  const [slot] = onSlotSelect.mock.calls[0]!;
  const endMinutes = slot.end.hour * 60 + slot.end.minute;
  expect(endMinutes - pointerMinutes).toBeGreaterThanOrEqual(0);
  expect(endMinutes - pointerMinutes).toBeLessThan(15);
});

test('pointer: dragging across month days selects whole days, and Escape cancels', async (context) => {
  skipWithoutCdp(context);
  const onSlotSelect = vi.fn();
  const screen = await render(inProvider({ defaultView: 'month', onSlotSelect }));
  await expect.element(screen.getByText('Algorithms')).toBeVisible();
  const pointIn = (day: string) => {
    const { left, bottom, width } = document
      .querySelector(`[data-scheduler-month-day="${day}"]`)!
      .getBoundingClientRect();
    return { x: left + width / 2, y: bottom - 6 };
  };
  const selectedDays = () =>
    [...document.querySelectorAll('[data-scheduler-month-day][data-selected]')].map((cell) =>
      cell.getAttribute('data-scheduler-month-day'),
    );

  const start = pointIn('2026-11-26');
  await mouse('mousePressed', start.x, start.y);
  await mouse('mouseMoved', pointIn('2026-11-25').x, start.y);
  await mouse('mouseMoved', pointIn('2026-11-24').x, start.y);
  await vi.waitFor(() =>
    expect(selectedDays()).toEqual(['2026-11-24', '2026-11-25', '2026-11-26']),
  );
  await mouse('mouseReleased', pointIn('2026-11-24').x, start.y);

  expect(onSlotSelect).toHaveBeenCalledTimes(1);
  const [slot] = onSlotSelect.mock.calls[0]!;
  expect(slot.start.toString()).toBe('2026-11-24T00:00:00');
  expect(slot.end.toString()).toBe('2026-11-27T00:00:00');
  expect(slot.allDay).toBe(true);

  await mouse('mousePressed', start.x, start.y);
  await mouse('mouseMoved', (start.x + pointIn('2026-11-27').x) / 2, start.y);
  await mouse('mouseMoved', pointIn('2026-11-27').x, start.y);
  await vi.waitFor(() => expect(selectedDays()).toHaveLength(2));
  await userEvent.keyboard('{Escape}');
  await vi.waitFor(() => expect(selectedDays()).toEqual([]));
  await mouse('mouseReleased', pointIn('2026-11-27').x, start.y);
  expect(onSlotSelect).toHaveBeenCalledTimes(1);
});

async function touch(type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) {
  await cdp().send('Input.dispatchTouchEvent', {
    type,
    touchPoints: type === 'touchEnd' ? [] : [frameOffset(x, y)],
  });
}

const TOUCH_HOLD_PAST_THE_DELAY = 400;

test('touch: holding an empty day and then dragging selects days, the same as a mouse', async (context) => {
  skipWithoutCdp(context);
  const onSlotSelect = vi.fn();
  const screen = await render(inProvider({ defaultView: 'month', onSlotSelect }));
  await expect.element(screen.getByText('Algorithms')).toBeVisible();
  const pointIn = (day: string) => {
    const { left, bottom, width } = document
      .querySelector(`[data-scheduler-month-day="${day}"]`)!
      .getBoundingClientRect();
    return { x: left + width / 2, y: bottom - 6 };
  };
  const start = pointIn('2026-11-24');
  const end = pointIn('2026-11-26');

  await touch('touchStart', start.x, start.y);
  await new Promise((resolve) => setTimeout(resolve, TOUCH_HOLD_PAST_THE_DELAY));
  await touch('touchMove', (start.x + end.x) / 2, start.y);
  await touch('touchMove', end.x, end.y);
  await touch('touchEnd', end.x, end.y);

  await vi.waitFor(() => expect(onSlotSelect).toHaveBeenCalledTimes(1));
  const [slot] = onSlotSelect.mock.calls[0]!;
  expect(slot.start.toString()).toBe('2026-11-24T00:00:00');
  expect(slot.end.toString()).toBe('2026-11-27T00:00:00');
});

test('pointer: dragging the bottom edge changes only the end, in quarter hours', async (context) => {
  skipWithoutCdp(context);
  const onEventChange = vi.fn();
  const screen = await render(inProvider({ onEventChange }));
  const edge = screen.getByRole('separator', { name: 'Lunch 끝 시각' });
  await expect.element(edge).toHaveAttribute('aria-valuetext', '오후 1:00');
  const column = edge.element().closest('[data-scheduler-column]')!;
  const hour = column.getBoundingClientRect().height / 24;

  await dragBy(edge.element(), 0, hour / 2 + 2);

  await vi.waitFor(() => expect(onEventChange).toHaveBeenCalledTimes(1));
  const [, change] = onEventChange.mock.calls[0]!;
  expect(change.start.toString()).toBe('2026-11-17T12:00:00');
  expect(change.end.toString()).toBe('2026-11-17T13:30:00');
});

test('keyboard: an event without onClick takes focus, Space picks it up and Escape puts it back', async () => {
  const onEventChange = vi.fn();
  const screen = await render(inProvider({ onEventChange }));
  const algo = document.querySelector<HTMLElement>('[data-scheduler-event="algo"]');
  expect(algo).toHaveAttribute('tabindex', '0');
  algo!.focus();
  await userEvent.keyboard('[Space]{ArrowUp}');
  await expect.element(screen.getByText(/오전 8:45 시작$/)).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
  await expect
    .element(screen.getByText('Algorithms을(를) 제자리에 두었습니다.'))
    .toBeInTheDocument();
  expect(onEventChange).not.toHaveBeenCalled();
  expect(algo!.closest<HTMLElement>('[data-scheduler-movable]')!.style.translate).toBe('');
});

const rightClickEvent = (target: Element, clientY = 0) => {
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    button: 2,
    clientY,
  });
  target.dispatchEvent(event);
  return event;
};

test('a right-click with no menu for its target leaves the browser menu alone', async () => {
  const screen = await render(inProvider({ eventMenu: () => null }));
  await expect.element(screen.getByText('Algorithms')).toBeInTheDocument();
  const column = document.querySelector('[data-scheduler-column="2026-11-16"]')!;
  expect(rightClickEvent(column).defaultPrevented).toBe(false);

  const bare = await render(inProvider({}));
  const event = bare.container.querySelector('[data-scheduler-event="algo"]')!;
  expect(rightClickEvent(event).defaultPrevented).toBe(false);
  expect(document.querySelector('[role="menu"]')).toBeNull();
});

test('a right-click on an all-day bar opens the event menu named after it', async () => {
  const eventMenu = vi.fn((event: Scheduler.EventData) => (
    <Menu.Item>Open {event.title}</Menu.Item>
  ));
  const slotMenu = vi.fn(() => <Menu.Item>Create here</Menu.Item>);
  const screen = await render(inProvider({ eventMenu, slotMenu }));
  await userEvent.click(screen.getByText('Festival'), { button: 'right' });
  await expect.element(screen.getByRole('menu', { name: 'Festival' })).toBeVisible();
  await expect.element(screen.getByRole('menuitem', { name: 'Open Festival' })).toBeVisible();
  expect(slotMenu).not.toHaveBeenCalled();
});

test('a right-click on an empty column hands slotMenu the half hour under the pointer', async () => {
  const slotMenu = vi.fn((slot: Scheduler.Slot) => (
    <Menu.Item>Create at {slot.start.hour}</Menu.Item>
  ));
  const screen = await render(inProvider({ slotMenu }));
  await expect.element(screen.getByText('Algorithms')).toBeInTheDocument();
  const column = document.querySelector<HTMLElement>('[data-scheduler-column="2026-11-18"]')!;
  const hour = column.getBoundingClientRect().height / 24;

  await userEvent.click(column, { button: 'right', position: { x: 8, y: hour * 14.7 } });

  await expect
    .element(screen.getByRole('menu', { name: '11월 18일 수요일 오후 2:30' }))
    .toBeVisible();
  const [slot] = slotMenu.mock.lastCall!;
  expect(slot.start.toString()).toBe('2026-11-18T14:30:00');
  expect(slot.end.toString()).toBe('2026-11-18T15:00:00');
});

test('a movable event still opens its menu on a right-click, without moving', async () => {
  const onEventChange = vi.fn();
  const screen = await render(
    inProvider({ onEventChange, eventMenu: () => <Menu.Item>Delete</Menu.Item> }),
  );
  await userEvent.click(screen.getByText('Lunch'), { button: 'right' });
  await expect.element(screen.getByRole('menuitem', { name: 'Delete' })).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();
  expect(onEventChange).not.toHaveBeenCalled();
});

test('a right-click with no menu for its target still reaches the app’s own handlers', async () => {
  const onContextMenu = vi.fn();
  const screen = await render(
    inProvider({ slotMenu: () => <Menu.Item>Create here</Menu.Item>, onContextMenu }),
  );
  await expect.element(screen.getByText('Algorithms')).toBeInTheDocument();
  const event = document.querySelector('[data-scheduler-event="algo"]')!;
  expect(rightClickEvent(event).defaultPrevented).toBe(false);
  expect(onContextMenu).toHaveBeenCalledTimes(1);
  expect(document.querySelector('[role="menu"]')).toBeNull();
});

test('the end handle straddles the bottom edge, and the hovered event rises above the one starting right after it', async () => {
  const screen = await render(
    inProvider({
      onEventChange: vi.fn(),
      events: [
        { id: 'lunch', title: 'Lunch', start: at(17, 12), end: at(17, 13) },
        { id: 'graph', title: 'Graph theory', start: at(17, 13), end: at(17, 14) },
      ],
    }),
  );
  const edge = screen.getByRole('separator', { name: 'Lunch 끝 시각' });
  await expect.element(edge).toBeInTheDocument();
  edge.element().scrollIntoView({ block: 'center' });
  const handle = edge.element().getBoundingClientRect();
  const event = document.querySelector('[data-scheduler-event="lunch"]')!.getBoundingClientRect();
  const slot = document.querySelector('[data-scheduler-slot="lunch"]')!.getBoundingClientRect();
  const x = handle.left + handle.width / 2;
  const above = event.bottom - 2;
  const below = slot.bottom + 2;
  expect(document.elementFromPoint(x, above)).toBe(edge.element());
  await userEvent.hover(screen.getByText('Graph theory'));
  expect(document.elementFromPoint(x, below)).not.toBe(edge.element());

  await userEvent.hover(screen.getByText('Lunch'));
  for (const y of [above, below]) expect(document.elementFromPoint(x, y)).toBe(edge.element());
});

test('no event box covers another, so every end handle can be grabbed', async () => {
  const screen = await render(
    inProvider({
      onEventChange: vi.fn(),
      events: [
        { id: 'long', title: 'Long', start: at(17, 18), end: at(17, 21) },
        { id: 'inside', title: 'Inside', start: at(17, 19), end: at(17, 19, 30) },
        { id: 'lunch', title: 'Lunch', start: at(17, 12), end: at(17, 13, 30) },
        { id: 'graph', title: 'Graph theory', start: at(17, 12, 45), end: at(17, 14) },
      ],
    }),
  );
  await expect.element(screen.getByText('Inside')).toBeInTheDocument();
  for (const name of ['Long', 'Inside', 'Lunch', 'Graph theory']) {
    const edge = screen.getByRole('separator', { name: `${name} 끝 시각` }).element();
    edge.scrollIntoView({ block: 'center' });
    const { left, width, top, height } = edge.getBoundingClientRect();
    expect(document.elementFromPoint(left + width / 2, top + height / 2)).toBe(edge);
  }
});
