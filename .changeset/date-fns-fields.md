---
"@gsainfoteam/ids-react": minor
---

Format DateField, TimeField and DateTimeField with date-fns. `format` takes a date-fns pattern or
a function, and the default text is the locale's short date (`2026.09.15`) and short time
(`오후 2:30` in Korean, `2:30 PM` in en-US, `14:30` in German). The clock follows the CLDR hour
cycle the browser's Intl reports for the locale, and the day period is placed the way the locale
writes it. `locale` takes `ko-KR` or `en-US`, or any date-fns `Locale`, and `disabled` takes the
same react-day-picker matchers as Calendar.

Breaking: Intl option objects are no longer accepted as `format`; pass a function instead. The
empty DateField.Input hint is the locale's short date pattern (`YYYY.MM.DD`).
