---
"@gsainfoteam/ids-react": minor
---

Breaking: Calendar, DateField, TimePicker, TimeField and DateTimeField take `locale` as a BCP 47
tag only and format with the browser's Intl, so any locale renders without an import. A date-fns
`Locale` object or an invalid tag throws. `format` takes `Intl.DateTimeFormatOptions` or a
function `(date, locale) => string`; date-fns pattern strings are gone. TimeField and
DateTimeField no longer take `format="12h" | "24h"`; use `hourCycle`, which also applies to
`format` options that show the hour without their own `hour12` / `hourCycle`.

To migrate:

- `locale={de}` becomes `locale="de-DE"`, and `import { de } from 'date-fns/locale'` goes away.
- `format="yyyy년 M월 d일"` becomes `format={{ dateStyle: 'long' }}` (or other Intl options), and
  a pattern Intl cannot express becomes a function.
- `format="24h"` on TimeField and DateTimeField becomes `hourCycle="24h"`.

The default date is the locale's two-digit numeric date (`2026. 09. 15.` in Korean,
`09/15/2026` in en-US, `15.09.2026` in German) and the typed-entry hint follows it
(`YYYY. MM. DD.`). DateTimeField joins the date and time the Intl way (`09/15/2026, 2:05 PM`).
The calendar builds its caption, weekday names, day numbers, dropdown labels and week numbers
from Intl with `numerals` as the numbering system, and its grid, weekday and day button labels
no longer fall back to English. The first weekday follows the locale, including a `-u-fw-`
extension. Typed dates are read with Intl too: fullwidth and native digits, localized month
names (`Sep 28, 2026`, `1. Oktober 2026`), the locale's numeric order and two-digit years
nearest to today; impossible dates such as `2026-02-30` are rejected.
