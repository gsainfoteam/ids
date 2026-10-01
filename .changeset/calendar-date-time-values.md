---
"@gsainfoteam/ids-react": minor
---

Breaking: DateTimeField takes `CalendarDateTime` values from `@internationalized/date` instead of
`Date`. `value`, `defaultValue`, `onValueChange`, `min` and `max` are `CalendarDateTime` (`| null`
for the value), a wall-clock date and time without a time zone; `today`, `month`, `defaultMonth`
and `onMonthChange` are `CalendarDate`, and `disabled` / `modifiers` take `DateMatcher` like
Calendar, so no react-day-picker type is left in the public API. Values are checked by shape, so
a `CalendarDateTime` from another copy of the package passes and a `Date` throws. Every wall-clock
time can be picked: the daylight-saving filter is gone, and the display is drawn in UTC so the
local zone shifts neither the day nor the time. `min` and `max` limit the clock only on their own
day, a `min` with milliseconds starts at the next whole second, and a `format` function receives
the `CalendarDateTime`. FormData strings are unchanged (`2026-09-15T14:30`, with seconds by
precision). The package no longer depends on `date-fns`.

To migrate:

- Create values with `new CalendarDateTime(2026, 9, 15, 14, 30)` (months start at 1) and `today`
  with `new CalendarDate(...)` or `today(getLocalTimeZone())`.
- Read `value.hour` / `value.day` instead of `getHours()` / `getDate()`; for an instant in a zone,
  use `toZoned(value, timeZone)` or `value.toDate(timeZone)`.
- Matchers receive a `CalendarDate`, and `{ from, to }` becomes `{ start, end }`.
- A zod schema's `z.date()` becomes
  `z.custom<CalendarDateTime>((value) => value instanceof CalendarDateTime)`.
