---
'@gsainfoteam/ids-react': minor
---

A pressable Card or Item (`onClick`) with a `Card.Title` / `Item.Title` no longer makes its whole
root a `role="button"`, which could not hold the buttons in `Card.Action`, `Card.Footer` or
`Item.Actions` (axe `nested-interactive`). The title is now rendered as the `<button>` that
keyboards and screen readers reach, described by the Description, while a press anywhere else on
the surface still calls `onClick`. `disabled` disables that button and marks the root
`aria-disabled`; `selected` on an Item is reported as the title button's `aria-pressed`. A
surface without a title written in its JSX keeps the old behaviour and is the button itself.
