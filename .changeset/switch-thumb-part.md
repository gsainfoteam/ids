---
'@gsainfoteam/ids-react': minor
---

Redraw Switch in the shadcn size (a 36 × 20px track with a 16px thumb, 28 × 16px and 12px for
`tiny`) over its real input, and add the `Switch.Thumb` part with `asChild` and state-function
children for an icon inside the thumb. The state is exposed as `data-state` and the other
`data-*` flags, `className`, `style` and `children` accept a function of `Switch.State`,
`readOnly` blocks toggling, the thumb moves the other way under `dir="rtl"`, a native form reset
restores `defaultChecked`, and a direct write to `input.checked` (react-hook-form `setValue` and
`reset`) moves the thumb. The size follows `Field` when not given.

Breaking: `onChange(checked, event)` is now `onCheckedChange(checked)`; `onChange` is the native
input event. `className` and `style` now go to the track instead of the input. The track is
smaller: 36 × 20px (`standard`) and 28 × 16px (`tiny`), down from 44 × 24px and 32 × 18px.
