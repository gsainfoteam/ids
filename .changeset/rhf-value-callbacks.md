---
'@gsainfoteam/ids-react': minor
---

The react-hook-form Field's `controlMode="value"` now binds a component's `onValueChange`, and
`controlMode="checked"` its `onCheckedChange`, following the IDS rule that value callbacks are
named `on*Change` and `onChange` is the native event, so a custom control connects without a
`Controller`. A value-first `onChange(value)` still reports, native `input` / `select` elements
still report through their change event, and one edit reported through two callbacks reaches
react-hook-form once.

Breaking: a change event a component passes on through `onChange` is no longer read as the value
in these modes: a formatting field's input shows text (`1,234`) that is not its value, and a
group hears the change events of its own checkboxes. A custom control that only forwards its
input's change event should use the default `native` mode, or report the value through
`onValueChange`.
