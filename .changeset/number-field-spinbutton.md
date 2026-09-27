---
'@gsainfoteam/ids-react': minor
---

NumberField is rebuilt on the shared text-control shell with its behaviour in `useNumberField`.
Home and End jump to `min` and `max`, Alt/Option+Arrow steps by the new `smallStep`, holding a
stepper keeps stepping after 0.4s and speeds up, and `allowWheelScrub` lets the wheel step while
the input has focus. `NumberField.Increment` and `NumberField.Decrement` place − and + beside
the input. An explicit `step` defines a grid anchored at `min`: a typed value snaps to it when
the edit is committed, and an arrow from an off-grid value moves to the next grid value, as
native `stepUp()` does. Out-of-range values also set native validity, so a form refuses them and
`Field.Error` shows why. The input defaults to `autoComplete="off"`, picks a numeric keypad for
integer-only fields and the full keyboard on iOS when negatives are allowed, and changes made by
keys, steppers or the wheel reach the enclosing Field.

Breaking: `onChange` is now the native input event; the value callback is
`onValueChange(value: number | null)`. `NumberField.Clear` is the shared Clear part: `onClear`
and `clearLabel` are gone (use `onClick` with `preventDefault()` and `aria-label`), and Escape
clears when it is present. The default labels are Korean. Stepper buttons leave the tab order,
a mouse press keeps focus in the input and a tap no longer focuses it. A value set from outside
is no longer clamped when the field is merely focused and left. The input no longer carries
`data-size`, and `NumberField.Style` extends the shared shell style.
