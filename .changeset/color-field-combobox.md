---
'@gsainfoteam/ids-react': patch
---

The ColorField trigger is a `role="combobox"` with `aria-haspopup="dialog"`, like the date and
time fields, so its `aria-required` is valid. `readOnly` is announced with `aria-readonly`
instead of `aria-disabled`.
