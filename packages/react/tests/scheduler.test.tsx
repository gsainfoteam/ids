import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import axe from 'axe-core';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { page, server, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider, Scheduler } from '../src';
import { testTheme } from './theme';
import { timedSegmentsOn } from '../src/components/data/scheduler/layout';

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
  expect(festival).toHaveLength(2);
  expect(nameOf(doc, festival[0].closest('ul')!)).toBe('2026년 11월 19일 목요일 종일');
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

test('overlapping events split the column into lanes, and the lanes end with the overlap', () => {
  const segments = timedSegmentsOn(EVENTS, on(17));
  expect(segments.map(({ event, lane, lanes }) => [event.id, lane, lanes])).toEqual([
    ['algo', 0, 2],
    ['room', 1, 2],
    ['lunch', 0, 1],
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

  await userEvent.keyboard(`{Shift>}${'{Tab}'.repeat(8 + gridStop.length)}{/Shift}`);
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

test('the grid opens scrolled to the first event of the range, or to 08:00 when that comes first', async () => {
  await render(inProvider({ events: [EVENTS[3]] }));
  const viewport = document.querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
  const hour = document.querySelector('section')!.getBoundingClientRect().height / 24;
  await expect.poll(() => Math.round(viewport.scrollTop)).toBe(Math.round(hour * 8));
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
