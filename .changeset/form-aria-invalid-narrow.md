---
"@gsainfoteam/ids-react": major
---

Single form controls read `aria-invalid`, the popup fields' `mobileVariant` is `narrow`, and
`Select.Group` names itself with a part.

- TextField, TextArea, NumberField, PasswordField, TelField, Input, Checkbox, Radio, Switch,
  Rating, SegmentedControl, Select, ColorField, DateField, TimeField, DateTimeField and Label lose
  `invalid`. Write `aria-invalid` instead: `<TextField invalid />` is `<TextField aria-invalid />`.
  Inside a `Field`, `CheckboxGroup` or `RadioGroup` nothing changes; those containers keep
  `invalid` and hand it down.
- Label reads `aria-invalid` for its danger color and leaves it off the `<label>`.
- `X.Content`'s `mobileVariant` is `narrow` on Select, ColorField, DateField, TimeField and
  DateTimeField, with the same values (`'drawer' | 'popover'`).
- Select now opens as a bottom sheet below 640px by default (`narrow="drawer"`). Keep the popover
  with `<Select.Content narrow="popover">`. Calendar, time and color popups still default to
  `'popover'`.
- `Select.Group`'s `heading` is the `Select.GroupLabel` part:
  `<Select.Group heading="한식">` is `<Select.Group><Select.GroupLabel>한식</Select.GroupLabel>…`.
