---
"@gsainfoteam/ids-react": major
---

Select takes `mobileVariant` on its popup part, like DateField, ChipField and ColorField.

- `<Select mobileVariant="drawer">` is `<Select><Select.Content mobileVariant="drawer">…</Select.Content></Select>`.
  The root reads the prop from the `Select.Content` element, so the options go inside it.
