---
"@gsainfoteam/ids-react": minor
---

Breaking: TimePicker and TimeField take `Time` values from `@internationalized/date` instead of
`Date`. `value`, `defaultValue`, `onValueChange`, `min` and `max` are `Time | null` (or `Time`),
a wall-clock time without a day or time zone, so the local zone and daylight saving no longer
shift or hide a time. Values are checked by shape (`hour`, `minute`, `second`, `millisecond` and
`compare`), so a `Time` from another copy of the package passes and a `Date` throws.
`referenceDate` is removed from both; an empty picker browses from the allowed time nearest
midnight. TimePicker's `format` prop is renamed `hourCycle`, like the fields, and
`TimePicker.State.format` / `data-format` become `hourCycle` / `data-hour-cycle`; the exported
`TimeFormat` type is now `HourCycle`. A TimeField `format` function receives the `Time`. FormData
strings are unchanged (`14`, `14:05`, `14:05:09`). DateTimeField still takes `Date`.

To migrate:

- Install `@internationalized/date` in the app and create values with `new Time(14, 30)`.
- Read `time.hour` / `time.minute` instead of `date.getHours()` / `date.getMinutes()`; combine a
  day and a time with `toCalendarDateTime(day, time)` or `new Date(y, m, d, time.hour, ...)`.
- Drop `referenceDate`.
- `<TimePicker format="24h" />` becomes `<TimePicker hourCycle="24h" />`.
- A zod schema's `z.date()` for a time becomes `z.custom<Time>((value) => value instanceof Time)`.
