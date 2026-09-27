---
"@gsainfoteam/ids-react": minor
---

The react-hook-form `Field` binds `onValueChange` in `controlMode="value"` as well as
`onChange`, so controls that report a raw value through `onValueChange` connect without extra
wiring. A handler the control already had still runs first.
