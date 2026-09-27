---
'@gsainfoteam/ids-react': minor
---

Redraw Checkbox as a shadcn-style 16px box over its real input, with a neutral border, a check
or dash glyph and the theme color only when checked. The state is exposed as `data-state`
(`checked` / `unchecked` / `indeterminate`) and the other `data-*` flags, and `className`,
`style` and `children` accept a function of `Checkbox.State`. `Checkbox.Indicator` takes
`asChild`. `readOnly` blocks toggling while the value is still submitted, a native form reset
restores `defaultChecked` including the mixed state, a click whose default is prevented does not
toggle, and a direct write to `input.checked` (react-hook-form `setValue` and `reset`) updates
the box. The size follows `Field` when not given.

Breaking: `onChange(checked, event)` is now `onCheckedChange(checked)`; `onChange` is the native
input event. The `indeterminate` prop is replaced by `checked="indeterminate"` (or
`defaultChecked`). The `filled` variant is renamed `soft`. `className` and `style` now go to the
drawn box instead of the input. The box is 16px (`standard`) and 14px (`tiny`), down from 20px
and 16px.
