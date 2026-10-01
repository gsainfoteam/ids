---
'@gsainfoteam/ids-react': minor
'@gsainfoteam/ids-css': minor
---

Rebuild OTPField on one real input drawn as slots. SMS autofill, select-all, word delete,
Shift+Arrow ranges, undo and the iOS long-press menu now work natively, a partial paste
overwrites from the selected slot, and a half-filled code fails native form validation.

Breaking: `onChange(value)` is now `onValueChange(value)`; `onChange` is the native input
event. The `filled` variant is renamed `soft` and `underline` is removed. `OTPField.Slot`
no longer renders an input or takes `asChild`; its `className` and `children` accept a
function of the slot state instead. Adds `OTPField.Group` and `OTPField.Caret`, and the
`animate-caret-blink` utility in the CSS package.
