---
'@gsainfoteam/ids-react': minor
---

The react-hook-form `Field` now binds `onValueChange` in `controlMode="value"` and
`onCheckedChange` in `controlMode="checked"`, next to `onChange`, so a custom control that reports
its value through a callback connects without a `Controller`. One edit reaches react-hook-form
once even when a control fires both callbacks, and change events bubbling up from a group's own
inputs are ignored.
