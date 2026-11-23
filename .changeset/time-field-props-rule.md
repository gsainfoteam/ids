---
'@gsainfoteam/ids-react': major
---

TimeField moves its clock and popup options to parts.

- `pickerVariant="wheel"` is `<TimeField.TimePicker variant="wheel" />`, which takes TimePicker's
  `variant`, `className` and columns.
- `mobileVariant` moves to `<TimeField.Content mobileVariant="drawer" />`. `TimeField.Content` now
  is the popup; its other props still go to the box inside it.
- `locale` is gone: the field reads the nearest `IdsProvider` `locale`.
