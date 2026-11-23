---
'@gsainfoteam/ids-react': major
---

DateField keeps only its own options on the root (`selectionMode`, the value, `min`, `max`,
`disabled`, `format`) and takes the calendar's through a part.

- `DateField.Calendar`, written as a child of DateField, takes Calendar's `monthsToShow`, `today`,
  `month` / `defaultMonth` / `onMonthChange` and its parts (`Calendar.Day`, `Calendar.Caption`,
  `Calendar.WeekNumber`, `Calendar.Footer`). These props are gone from the root, together with
  `captionLayout`, `showWeekNumber`, `modifiers`, `modifiersClassNames`, `renderDay`, `footer`,
  `weekStartsOn`, `numerals`, `showOutsideDays` and `fixedWeeks` (see the Calendar changeset).
- `locale` is gone: the field reads the nearest `IdsProvider` `locale`.
- `mobileVariant` moves to the popup part: `<DateField.Content mobileVariant="drawer" />`.
  `DateField.Content` now is the popup; its other props still go to the box inside it.
