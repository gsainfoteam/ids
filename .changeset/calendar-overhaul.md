---
'@gsainfoteam/ids-react': minor
---

Restyle Calendar after shadcn/ui (12px day cells, solid primary selection, a muted range band
that rounds off at week ends, muted today and outside days) and move its logic into
`useCalendar`. New: month and year menus with `captionLayout="dropdown"`, a range preview that
follows the pointer or the keyboard before the end is picked, right-to-left arrow keys, localized
digits, narrow weekday names for locales whose short names do not fit, a CLDR fallback for the
first weekday where `Intl.Locale` has no week data, an `aria-live` announcement when the month
changes, `Calendar.Month`, `Calendar.Previous`, `Calendar.Next`, `Calendar.Title`,
`Calendar.MonthSelect` and `Calendar.YearSelect` parts, `Calendar.State`, and function
`className` / `style` on the root and `Calendar.Grid.Cell`. With several months each month gets
its own caption, Previous on the first and Next on the last.

Breaking: `onChange` is now `onValueChange`, and it no longer fires when the selected day is
picked again. The default `locale` is `ko-KR` (from the shared messages) instead of `en-US`. The
month buttons use `aria-disabled` instead of `disabled`, so they keep focus at a limit.
`data-range-endpoint` is replaced by `data-range-start` / `data-range-end`, and the range band is
the cell background (`data-band`) instead of a `data-calendar-range-band` element.
