---
'@gsainfoteam/ids-react': minor
---

The react-hook-form Field's `controlMode="value"` now binds a component's `onValueChange`, and
`controlMode="checked"` its `onCheckedChange`, following the IDS rule that value callbacks are
named `on*Change` and `onChange` is the native event. A value-first `onChange(value)` still
reports, and native `input` / `select` elements still report through their change event.

Breaking: a change event a component forwards through `onChange` is no longer read as the value
in these modes, because a formatting field's input shows text (`1,234`) that is not its value.
A custom control that only forwards its input's change event should use the default `native`
mode, or report the value through `onValueChange`.
