---
"@gsainfoteam/ids-react": minor
---

Breaking: Calendar and DateField take `CalendarDate` values from `@internationalized/date`
instead of `Date`. A single value is `CalendarDate | null`, a range
`{ start: CalendarDate | null; end: CalendarDate | null } | null` and multiple `CalendarDate[]`;
`min`, `max`, `today`, `month`, `defaultMonth` and `onMonthChange` are `CalendarDate` too (a month
is its first day). A date has no time or time zone, so the local zone no longer shifts the shown
or selected day. Values are checked by shape (`year`, `month`, `day`, `calendar.identifier` and
`compare`), so a `CalendarDate` from another copy of the package passes; a `Date` throws, and so
does a non-gregorian date. `disabled` and `modifiers` take the new `DateMatcher`
(`CalendarDate`, `CalendarDate[]`, `{ start, end }`, `{ before }`, `{ after }`, `{ dayOfWeek }`, a
function of a `CalendarDate`, or a boolean), exported as `Calendar.DateMatcher` and `DateMatcher`.
The react-day-picker passthroughs `components`, `formatters` and `labels`, `Calendar.DayButton`,
`Calendar.DayButtonProps`, `Calendar.Components`, `Calendar.DayModifiers` and the re-exported
`Matcher` are removed; `renderDay(day, state)` replaces the content of a day button while IDS
keeps drawing the button, its focus and its `data-*` state. A DateField `format` function receives
the `CalendarDate`, typed input is read as a `CalendarDate`, and FormData strings are unchanged
(`2026-09-15`, `start/end`, one entry per day). DateTimeField still takes `Date`.

To migrate:

- Install `@internationalized/date` and create values with `new CalendarDate(2026, 9, 15)`
  (months start at 1); today is `today(getLocalTimeZone())`.
- Read `date.year` / `date.month` / `date.day` instead of `getFullYear()` / `getMonth() + 1` /
  `getDate()`, and compare with `date.compare(other)` or `isSameDay(a, b)`.
- A date in another calendar goes through `toCalendar(date, new GregorianCalendar())`; to show
  another calendar, put it in the locale tag (`ja-JP-u-ca-japanese`).
- `disabled={{ from, to }}` becomes `disabled={{ start, end }}`, and matcher functions receive a
  `CalendarDate`.
- `components={{ DayButton }}` wrapping `Calendar.DayButton` becomes `renderDay`, which gets the
  day and `Calendar.DayState` (`selected`, `today`, `outside`, `disabled`, `rangeStart`,
  `rangeMiddle`, `rangeEnd`, `modifiers`).
- `formatters` and `labels` are dropped; captions, weekday names and labels come from Intl through
  `locale` and `numerals`.
- A zod schema's `z.date()` becomes `z.custom<CalendarDate>((value) => value instanceof CalendarDate)`.
