---
"@gsainfoteam/ids-react": minor
---

Format DateField, TimeField and DateTimeField with date-fns. `format` takes a date-fns pattern or
a function, and the default text is the locale's short date (`2026.09.15`) and short time
(`14:30`, or `2:30 PM` in en-US), with the day period placed the way the locale writes it
(`오후 2:30`) when the clock differs from the locale's own. `locale` takes `ko-KR` or `en-US`, or
any date-fns `Locale`, and `disabled` takes the same react-day-picker matchers as Calendar.

Breaking: Intl option objects are no longer accepted as `format`; pass a function instead. Korean
times default to a 24-hour clock, as date-fns writes them. The empty DateField.Input hint is the
locale's short date pattern (`YYYY.MM.DD`).
