---
'@gsainfoteam/ids-react': minor
---

Field now tracks its control the way Base UI does. `data-focused`, `data-filled`, `data-dirty`,
`data-touched`, `data-invalid`, `data-disabled`, `data-required`, `data-orientation` and
`data-size` sit on the root and on every part, `className` / `style` / `children` accept a
function of that state, and `useFieldState()` reads it from a custom control. `dirty` and
`touched` can be passed in; the react-hook-form Field passes RHF's `isDirty` and `isTouched`.

`Field.Error` without content shows the control's native `validationMessage`: after a submit
attempt, or when a changed value is left invalid, and it clears as soon as the value is valid.
`match` shows an error only for one `ValidityState` flag, and several errors can sit in one
Field. A form with `noValidate` keeps Field out of native validation, and an explicit `invalid`
still wins. An error with nothing to show no longer renders an empty node or enters
`aria-describedby`.

`Field.Label` is drawn with `Label`: it takes the field's size, required asterisk, disabled and
invalid looks from Label, carries `data-label`, and pressing it moves focus to a custom control
such as a RadioGroup. `Field.Style` loses its `label` and `marker` slots.

Breaking: the layout prop is `orientation` and the root carries `data-orientation` instead of
`data-variant`. `variant` still works as a deprecated alias. When react-hook-form has no error
for a field, the Field no longer forces `invalid={false}`, so native validation can report.
