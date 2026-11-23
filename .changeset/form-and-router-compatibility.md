---
'@gsainfoteam/ids-react': minor
---

Fixes found by the form, schema, router and date compatibility tests:

- NumberField and TelField no longer submit `name=""` when empty, like every other control.
- OTPField keeps a value react-hook-form `register` writes on mount or on `reset()`.
- ToggleGroup's root takes focus (`tabIndex={-1}`) and hands it to the pressed or first enabled
  toggle, so react-hook-form `setFocus` and error focus reach it.
- Dialog, Drawer, Popover, Menu and Tooltip triggers set `type="button"` on an `asChild` `<button>`
  child that has no `type`, so they no longer submit the enclosing form.
- DateTimeField refuses a `ZonedDateTime` instead of dropping its zone; convert it with
  `toCalendarDateTime(value)`. DateField checks `min` and `max` up front.
- Avatar and Image type `src` as `string`, so a project whose React types allow `Blob` (Next's
  experimental types) still compiles.
