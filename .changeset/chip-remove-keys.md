---
'@gsainfoteam/ids-react': minor
---

Rebuild Chip around what it does: a clickable or selectable chip is a real `<button>`
(`aria-pressed` when it toggles), and `onRemove` adds a default remove button named after the
chip's text ("react 삭제"). Backspace or Delete on a focused chip or its remove button removes it
and hands focus to the neighbouring chip. `onRemove` receives the click or key event that asked
for the removal, and `preventDefault()` on it leaves focus to the handler instead, for a tag field
that sends it back to its input. A chip that is both selectable and removable draws its X
for the pointer only, so no button sits inside a button, and pressing the X no longer toggles it.
Plain text becomes a truncating `Chip.Label`, chips can be `disabled`, hover and press lay a veil
in the text color over any variant, and `className` / `style` / `children` take the chip state.
The remove button is a ghost `IconButton` in the chip's color scheme, so its focus ring follows
the scheme. A chip that cannot be pressed reports keyboard focus on its remove button as its own
`data-focus-visible` and `focusVisible` state.

Breaking: `Chip.Close` no longer takes `onClose`; pass `onRemove` to the Chip, and `Chip.Close`
only changes the glyph or label. The neutral `solid` chip is the inverted on-surface color.
`selected` without `onSelectedChange` warns in development instead of throwing. Part prop types
move to `Chip.Icon.Props`, `Chip.Label.Props` and `Chip.Close.Props`.
