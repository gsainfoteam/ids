---
'@gsainfoteam/ids-react': major
---

DateTimeField keeps `min`, `max`, `disabled`, `precision`, `format`, `hourCycle` and `step` on the
root, and takes the calendar's and the clock's options through parts.

- `DateTimeField.Calendar` takes Calendar's `monthsToShow`, `today`, `month` / `defaultMonth` /
  `onMonthChange` and its parts. `today` there is also the day a time picked on an empty field
  lands on.
- `DateTimeField.TimePicker` takes TimePicker's `variant`, `className` and columns:
  `pickerVariant="wheel"` is `<DateTimeField.TimePicker variant="wheel" />`.
- `locale` is gone: the field reads the nearest `IdsProvider` `locale`.
- `mobileVariant` moves to `<DateTimeField.Content mobileVariant="drawer" />`.
