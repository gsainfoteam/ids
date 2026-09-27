---
'@gsainfoteam/ids-react': minor
---

TextField is rebuilt on a text-control shell the other text fields can share. `TextField.Clear`
shows only while the field has a value, clears through a real edit so `onChange`,
`onValueChange` and react-hook-form's `register()` all see it, and keeps focus in the input; with
a Clear part present, Escape clears too. `onValueChange(value)` reports the string next to the
native `onChange`, and `invalid` sets `aria-invalid`.

The shell carries `data-invalid`, `data-focused`, `data-filled`, `data-readonly` and
`data-disabled`, so an invalid input now draws the danger border and ring, and `className` /
`style` accept a function of that state. A value written without an input event
(react-hook-form `setValue`, a form reset) is followed too, and reaches the enclosing Field.

Buttons placed next to the input shrink to the 28px (tiny 24px) inset height, square for icon
buttons, and sit 4px inside the border instead of losing their padding. The input is marked `data-field-input` and gets a generated `id`
when none is given. The unexported `textFieldSurface`, `textFieldAdornment` and
`TextFieldContext` helpers are gone.
