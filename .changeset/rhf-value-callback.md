---
'@gsainfoteam/ids-react': minor
---

The react-hook-form `Field` in `controlMode="value"` also listens on the control's `onValueChange`,
so a custom control that reports a raw value binds without extra code. When a control reports one
edit both as a change event and through `onValueChange`, the value from `onValueChange` is kept.
