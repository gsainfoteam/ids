---
'@gsainfoteam/ids-react': minor
---

Rebuild Slider in the shadcn size with `Slider.Track`, `Slider.Range` and `Slider.Thumb` parts
(each with `asChild` and state-function `className`, `style` and `children`), thumbs drawn inside
the track so the slider stays flush with its box, and a pointer mapping that matches the drawn
thumb so grabbing it never jumps. Keys follow the WAI-ARIA slider pattern (Up/Down on every
orientation, Shift and PageUp/PageDown for `largeStep`, Home/End) and flip under `dir="rtl"`.
Adds `onValueCommit` (pointer release or key release), `minStepsBetweenThumbs`, `readOnly`,
`invalid`, a value label shown while dragging or keyboard-focused (`valueLabel`), form
participation through one hidden input per thumb (`name`, `form`) with reset to `defaultValue`,
the size from `Field`, a stable root for `ref` and `id` whose `focus()` moves to a thumb, and
`touch-action` that lets the page scroll across the slider. Stacked range thumbs split by the
direction of the first move. `value` and callbacks are typed by `selectionMode`.

Breaking: `onChange(value)` is now `onValueChange(value)`, typed `number` or `[number, number]`
by `selectionMode`. `marks={true}` draws a tick per step without labels; labels come with a
`marks` array. Values outside `[min, max]` are clamped with a development warning instead of
throwing. The thumb is 16px (`standard`) and 14px (`tiny`).
