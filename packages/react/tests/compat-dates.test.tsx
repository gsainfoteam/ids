import { type ReactNode } from 'react';

import {
  type CalendarDate,
  type CalendarDateTime,
  fromDate,
  getLocalTimeZone,
  parseDate,
  resetLocalTimeZone,
  type Time,
  toCalendarDate,
  toCalendarDateTime,
  toTime,
  toZoned,
} from '@internationalized/date';
import { addDays, endOfDay, format, isSameDay, parseISO, setHours, startOfDay } from 'date-fns';
import { renderToString } from 'react-dom/server';
import { describe, expect, onTestFinished, test, type TestContext } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Calendar, DateField, DateTimeField, IdsProvider, Scheduler, TimeField } from '../src';
import { skipWithoutCdp } from './engines';
import { testTheme } from './theme';

const inIds = (ui: ReactNode) => <IdsProvider theme={testTheme}>{ui}</IdsProvider>;
const day = (key: string) =>
  document.querySelector<HTMLButtonElement>(`[data-calendar-day="${key}"]`)!;
const hourOption = (hour: number) =>
  document.querySelector<HTMLElement>(
    `[role=dialog] [data-time-column="hour"] [data-time-option="${hour}"]`,
  )!;
const shownDay = (key: string) => `${key.replaceAll('-', '. ')}.`;
const wallClockIn = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);

async function inBrowserZone(context: TestContext, timeZone: string) {
  skipWithoutCdp(context);
  onTestFinished(async () => {
    await cdp().send('Emulation.setTimezoneOverride', { timezoneId: '' });
    resetLocalTimeZone();
  });
  await cdp().send('Emulation.setTimezoneOverride', { timezoneId: timeZone });
  resetLocalTimeZone();
  expect(getLocalTimeZone()).toBe(timeZone);
}

const BROWSER_ZONES = [
  'Asia/Seoul',
  'America/Los_Angeles',
  'Pacific/Kiritimati',
  'Pacific/Pago_Pago',
  'America/Santiago',
];

const lateEvening = () => new Date(2026, 8, 5, 23, 30);

describe.each(BROWSER_ZONES)('an app in %s that holds Date objects', (zone) => {
  test('DateField shows the local day of a late-evening Date and a pick converts back to that local day', async (context) => {
    await inBrowserZone(context, zone);
    const base = lateEvening();
    let picked = null as CalendarDate | null;
    const screen = await render(
      inIds(
        <DateField
          value={toCalendarDate(fromDate(base, getLocalTimeZone()))}
          onValueChange={(next) => (picked = next)}
        />,
      ),
    );
    const trigger = screen.getByRole('combobox');

    await expect.element(trigger).toMatchTextContent('2026. 09. 05.');

    await userEvent.click(trigger);
    await userEvent.click(day('2026-09-06'));

    expect(picked?.toString()).toBe('2026-09-06');
    const back = picked!.toDate(getLocalTimeZone());
    expect(back.getTime()).toBe(startOfDay(addDays(base, 1)).getTime());
    expect(isSameDay(back, addDays(base, 1))).toBe(true);
  });

  test('a date-fns parseISO date-only value submits the same day date-fns formats', async (context) => {
    await inBrowserZone(context, zone);
    const due = parseISO('2026-09-05');
    const screen = await render(
      inIds(
        <form>
          <DateField name="due" defaultValue={parseDate(format(due, 'yyyy-MM-dd'))} />
        </form>,
      ),
    );

    await expect.element(screen.getByRole('combobox')).toMatchTextContent('2026. 09. 05.');
    const submitted = new FormData(screen.container.querySelector('form')!).get('due');
    expect(submitted).toBe(format(due, 'yyyy-MM-dd'));
    expect(parseISO(String(submitted)).getTime()).toBe(due.getTime());
  });

  test('Calendar selects the local day of a Date and a pick converts back with date-fns days', async (context) => {
    await inBrowserZone(context, zone);
    const base = lateEvening();
    let picked = null as CalendarDate | null;
    await render(
      inIds(
        <Calendar
          aria-label="달력"
          value={toCalendarDate(fromDate(startOfDay(base), getLocalTimeZone()))}
          onValueChange={(next) => (picked = next)}
        />,
      ),
    );

    await expect.element(day('2026-09-05')).toHaveAttribute('data-selected');

    await userEvent.click(day('2026-09-07'));

    expect(picked!.toDate(getLocalTimeZone()).getTime()).toBe(
      startOfDay(addDays(base, 2)).getTime(),
    );
  });

  test('min and max built from Dates block the days outside them', async (context) => {
    await inBrowserZone(context, zone);
    const base = lateEvening();
    const tz = getLocalTimeZone();
    const screen = await render(
      inIds(
        <DateField
          defaultValue={toCalendarDate(fromDate(base, tz))}
          min={toCalendarDate(fromDate(startOfDay(base), tz))}
          max={toCalendarDate(fromDate(endOfDay(addDays(base, 2)), tz))}
        />,
      ),
    );

    await userEvent.click(screen.getByRole('combobox'));

    await expect.element(day('2026-09-04')).toHaveAttribute('data-disabled');
    await expect.element(day('2026-09-05')).not.toHaveAttribute('data-disabled');
    await expect.element(day('2026-09-07')).not.toHaveAttribute('data-disabled');
    await expect.element(day('2026-09-08')).toHaveAttribute('data-disabled');
  });

  test('DateTimeField shows the local wall time of a Date and a pick converts back to the same time on the new day', async (context) => {
    await inBrowserZone(context, zone);
    const base = lateEvening();
    let picked = null as CalendarDateTime | null;
    const screen = await render(
      inIds(
        <DateTimeField
          defaultValue={toCalendarDateTime(fromDate(base, getLocalTimeZone()))}
          hourCycle="24h"
          onValueChange={(next) => (picked = next)}
        />,
      ),
    );
    const trigger = screen.getByRole('combobox');

    await expect.element(trigger).toMatchTextContent('2026. 09. 05. 23:30');

    await userEvent.click(trigger);
    await userEvent.click(day('2026-09-06'));

    expect(picked?.toString()).toBe('2026-09-06T23:30:00');
    expect(picked!.toDate(getLocalTimeZone()).getTime()).toBe(addDays(base, 1).getTime());
  });

  test('a DateTimeField min built from a Date blocks the hours before it on its day', async (context) => {
    await inBrowserZone(context, zone);
    const base = lateEvening();
    const min = toCalendarDateTime(fromDate(base, getLocalTimeZone()));
    const screen = await render(
      inIds(<DateTimeField defaultValue={min} min={min} hourCycle="24h" />),
    );

    await userEvent.click(screen.getByRole('combobox'));

    await expect.element(day('2026-09-04')).toHaveAttribute('data-disabled');
    await expect.element(hourOption(22)).toHaveAttribute('aria-disabled', 'true');
    await expect.element(hourOption(23)).not.toHaveAttribute('aria-disabled');
  });

  test('TimeField shows the local time of a Date and a pick joins back onto that Date', async (context) => {
    await inBrowserZone(context, zone);
    const base = lateEvening();
    const tz = getLocalTimeZone();
    let picked = null as Time | null;
    const screen = await render(
      inIds(
        <TimeField
          defaultValue={toTime(fromDate(base, tz))}
          hourCycle="24h"
          onValueChange={(next) => (picked = next)}
        />,
      ),
    );
    const trigger = screen.getByRole('combobox');

    await expect.element(trigger).toMatchTextContent('23:30');

    await userEvent.click(trigger);
    await userEvent.click(hourOption(7));

    expect(picked?.toString()).toBe('07:30:00');
    const joined = toCalendarDateTime(toCalendarDate(fromDate(base, tz)), picked!);
    expect(joined.toDate(tz).getTime()).toBe(setHours(base, 7).getTime());
  });

  test('Scheduler places an event built from Dates on their local day and wall time', async (context) => {
    await inBrowserZone(context, zone);
    const tz = getLocalTimeZone();
    const start = new Date(2026, 8, 5, 21, 0);
    const end = new Date(2026, 8, 5, 22, 0);
    await render(
      inIds(
        <div className="flex h-[600px] flex-col">
          <Scheduler
            aria-label="일정표"
            defaultView="day"
            defaultDate={toCalendarDate(fromDate(start, tz))}
            events={[
              { id: 'call', title: 'Call', start: fromDate(start, tz), end: fromDate(end, tz) },
            ]}
          />
        </div>,
      ),
    );
    const event = () => document.querySelector<HTMLElement>('[data-scheduler-event="call"]');

    await expect.poll(event).not.toBeNull();
    expect(event()!.closest('[data-scheduler-column]')).toHaveAttribute(
      'data-scheduler-column',
      '2026-09-05',
    );
    expect(event()!.querySelector('time')).toHaveAttribute('dateTime', '2026-09-05T21:00:00');
  });
});

const INSTANT = '2026-09-15T23:30:00Z';

const VIEWERS = [
  { zone: 'UTC', day: '2026-09-15', time: '23:30' },
  { zone: 'Asia/Seoul', day: '2026-09-16', time: '08:30' },
  { zone: 'America/Los_Angeles', day: '2026-09-15', time: '16:30' },
  { zone: 'Pacific/Kiritimati', day: '2026-09-16', time: '13:30' },
  { zone: 'Pacific/Pago_Pago', day: '2026-09-15', time: '12:30' },
];

describe.each(VIEWERS)('an instant near UTC midnight shown in $zone', (viewer) => {
  test(`DateField shows ${viewer.day} and a pick converts back to midnight in the zone`, async () => {
    const instant = parseISO(INSTANT);
    let picked = null as CalendarDate | null;
    const screen = await render(
      inIds(
        <DateField
          value={toCalendarDate(fromDate(instant, viewer.zone))}
          onValueChange={(next) => (picked = next)}
        />,
      ),
    );
    const trigger = screen.getByRole('combobox');

    await expect.element(trigger).toMatchTextContent(shownDay(viewer.day));

    await userEvent.click(trigger);
    await userEvent.click(day('2026-09-20'));

    expect(wallClockIn(picked!.toDate(viewer.zone), viewer.zone)).toBe('2026-09-20, 00:00');
  });

  test(`DateTimeField shows ${viewer.time} and its value converts back to the same instant`, async () => {
    const instant = parseISO(INSTANT);
    const value = toCalendarDateTime(fromDate(instant, viewer.zone));
    let picked = null as CalendarDateTime | null;
    const screen = await render(
      inIds(
        <DateTimeField
          defaultValue={value}
          hourCycle="24h"
          onValueChange={(next) => (picked = next)}
        />,
      ),
    );
    const trigger = screen.getByRole('combobox');

    await expect.element(trigger).toMatchTextContent(`${shownDay(viewer.day)} ${viewer.time}`);
    expect(toZoned(value, viewer.zone).toDate().getTime()).toBe(instant.getTime());

    await userEvent.click(trigger);
    await userEvent.click(day('2026-09-20'));

    expect(wallClockIn(toZoned(picked!, viewer.zone).toDate(), viewer.zone)).toBe(
      `2026-09-20, ${viewer.time}`,
    );
  });
});

const NEW_YORK = 'America/New_York';

const WALL_CLOCK_LOSES_THE_OFFSET =
  'open: DateTimeField holds a CalendarDateTime, which has no offset, so the second 01:30 of the fall-back hour converts back to the first; telling them apart needs ZonedDateTime values (decision)';

const DST_INSTANTS = [
  {
    moment: 'the first hour after the spring gap',
    iso: '2026-03-08T07:30:00.000Z',
    shown: '2026. 03. 08. 03:30',
    today: 'pass',
  },
  {
    moment: 'the first 01:30 of the fall overlap',
    iso: '2026-11-01T05:30:00.000Z',
    shown: '2026. 11. 01. 01:30',
    today: 'pass',
  },
  {
    moment: 'the second 01:30 of the fall overlap',
    iso: '2026-11-01T06:30:00.000Z',
    shown: '2026. 11. 01. 01:30',
    today: WALL_CLOCK_LOSES_THE_OFFSET,
  },
];

describe('daylight saving time, converted through the zone', () => {
  for (const instant of DST_INSTANTS) {
    const run = instant.today === 'pass' ? test : test.fails;

    run(
      `DateTimeField in ${NEW_YORK}: ${instant.moment} round-trips (${instant.today})`,
      async () => {
        const value = toCalendarDateTime(fromDate(parseISO(instant.iso), NEW_YORK));
        const screen = await render(inIds(<DateTimeField defaultValue={value} hourCycle="24h" />));

        await expect.element(screen.getByRole('combobox')).toMatchTextContent(instant.shown);
        expect(toZoned(value, NEW_YORK).toDate().toISOString()).toBe(instant.iso);
      },
    );
  }

  test(`DateTimeField in ${NEW_YORK}: a wall time the spring gap skips stays shown and converts one hour later`, async () => {
    let picked = null as CalendarDateTime | null;
    const screen = await render(
      inIds(
        <DateTimeField
          defaultValue={toCalendarDateTime(fromDate(parseISO('2026-03-08T06:30:00Z'), NEW_YORK))}
          hourCycle="24h"
          onValueChange={(next) => (picked = next)}
        />,
      ),
    );
    const trigger = screen.getByRole('combobox');

    await userEvent.click(trigger);
    await userEvent.click(hourOption(2));
    await userEvent.keyboard('{Escape}');

    await expect.element(trigger).toMatchTextContent('2026. 03. 08. 02:30');
    expect(picked?.toString()).toBe('2026-03-08T02:30:00');
    expect(toZoned(picked!, NEW_YORK).toString()).toBe(
      '2026-03-08T03:30:00-04:00[America/New_York]',
    );
  });

  const DST_DAYS = [
    { zone: NEW_YORK, key: '2026-03-08' },
    { zone: NEW_YORK, key: '2026-11-01' },
    { zone: 'America/Santiago', key: '2026-09-06' },
  ];

  test.each(DST_DAYS)(
    'DateField in $zone: the start of $key round-trips',
    async ({ zone, key }) => {
      const startOfTheDay = parseDate(key).toDate(zone);
      const value = toCalendarDate(fromDate(startOfTheDay, zone));
      const screen = await render(inIds(<DateField value={value} />));

      await expect.element(screen.getByRole('combobox')).toMatchTextContent(shownDay(key));
      expect(value.toString()).toBe(key);
      expect(value.toDate(zone).getTime()).toBe(startOfTheDay.getTime());
    },
  );
});

const aDate = new Date(2026, 8, 15, 9, 30);
const aZonedDate = fromDate(aDate, 'Asia/Seoul');

const UNCONVERTED = [
  {
    field: 'Calendar',
    given: 'a Date',
    ui: <Calendar aria-label="달력" value={aDate as never} />,
    error: /expected a CalendarDate/,
  },
  {
    field: 'DateField',
    given: 'a Date',
    ui: <DateField value={aDate as never} />,
    error: /expected a CalendarDate/,
  },
  {
    field: 'DateField',
    given: 'a ZonedDateTime',
    ui: <DateField value={aZonedDate as never} />,
    error: /expected a CalendarDate/,
  },
  {
    field: 'DateField',
    given: 'a Date min',
    ui: <DateField min={aDate as never} />,
    error: /expected a CalendarDate/,
  },
  {
    field: 'DateTimeField',
    given: 'a Date',
    ui: <DateTimeField value={aDate as never} />,
    error: /expected a CalendarDateTime/,
  },
  {
    field: 'TimeField',
    given: 'a Date',
    ui: <TimeField value={aDate as never} />,
    error: /expected a Time/,
  },
];

describe('a Date handed over without converting', () => {
  test.each(UNCONVERTED)('$field given $given names the type it takes', ({ ui, error }) => {
    expect(() => renderToString(inIds(ui))).toThrow(error);
  });

  test('DateTimeField given a ZonedDateTime refuses it like DateField does', () => {
    expect(() => renderToString(inIds(<DateTimeField value={aZonedDate as never} />))).toThrow(
      /expected a CalendarDateTime/,
    );
  });
});
