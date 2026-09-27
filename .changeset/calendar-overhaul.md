---
'@gsainfoteam/ids-react': minor
---

Rebuild Calendar on react-day-picker 10 and style it after shadcn/ui (12px day cells, solid
primary selection, a muted range band that rounds off at week and month ends, muted today and
outside days). Month and weekday names and the first weekday come from date-fns: `locale` takes
`ko-KR` or `en-US`, or any date-fns `Locale`, and a locale from `react-day-picker/locale` keeps its
own translated labels. New: year and month menus with `captionLayout="dropdown"` (a century either
side of today without `min` / `max`), a range preview that follows the pointer or the keyboard
before the end is picked, right-to-left arrow keys from `dir` or the inherited direction,
`disabled` as react-day-picker matchers (a function, dates, ranges or weekdays), month captions
announced as they change, `Calendar.DayButton` for custom day content, the react-day-picker
`components`, `modifiers`, `modifiersClassNames`, `formatters`, `labels`, `footer`,
`showWeekNumber`, `showOutsideDays`, `fixedWeeks` and `numerals` options, `Calendar.State`, and
function `className` / `style` on the root. With several months, Previous sits on the first and
Next on the last.

Breaking: `onChange` is now `onValueChange`, and it no longer fires when the selected day is
picked again. The default `locale` is `ko-KR` (from the shared messages) instead of `en-US`, and a
tag other than `ko` / `ko-KR` / `en` / `en-US` throws; pass a date-fns `Locale` instead. The
keyboard skips disabled days, and a click on a neighbouring month's day no longer moves the
month. `Calendar.Header`, `Calendar.Navigation` and `Calendar.Grid` with its `HeaderRow`, `Body`
and `Cell` are replaced by react-day-picker `components`. Day buttons carry `data-calendar-day`,
`data-selected`, `data-today`, `data-disabled`, `data-outside` and `data-range-start` /
`data-range-middle` / `data-range-end` / `data-range-preview`; `data-range-endpoint` and the range
band element are gone.
