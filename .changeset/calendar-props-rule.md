---
"@gsainfoteam/ids-react": major
---

Calendar follows the props rule: options that only set a look or belong to one screen element
move to parts, and the locale comes from `IdsProvider`.

- `locale`, `weekStartsOn` and `numerals` are gone. The calendar reads the nearest `IdsProvider`
  `locale`; put the week start and the digits in the tag (`ko-KR-u-fw-mon`, `ar-EG-u-nu-arab`),
  or wrap one calendar in its own `<IdsProvider.Scope locale="en-US">`.
- `captionLayout="dropdown"` is `<Calendar.Caption layout="dropdown" />`.
- `showWeekNumber` is `<Calendar.WeekNumber />`; its `className` styles the week number cells.
- `modifiers` and `renderDay` are `<Calendar.Day modifiers={…}>{(day, state) => …}</Calendar.Day>`.
  `modifiersClassNames` is gone: the children function reads `state.modifiers` and draws the day's
  content.
- `footer` is `<Calendar.Footer>…</Calendar.Footer>`, a `role="status"` `div` that takes `asChild`.
- `showOutsideDays` and `fixedWeeks` are gone. The calendar always draws six weeks, and shows the
  days of the next and previous month only when it shows one month.
- `selectionMode="none"` is gone: use `readOnly`.
