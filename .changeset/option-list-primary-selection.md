---
'@gsainfoteam/ids-react': minor
---

Select, ChipField and Menu draw a chosen option the way DataTable draws a selected row: a selected
option and a checked `Menu.CheckboxItem` or `Menu.RadioItem` is `bg-primary-soft` with
`text-on-primary-soft`, and its check or dot is `text-primary`. Neighbouring chosen options join into
one shape. A highlighted option stays on the neutral ladder (`bg-neutral-soft`, pressed
`bg-neutral-soft-hover`), a highlighted chosen one takes `bg-primary-soft-hover` (pressed
`bg-primary-soft-active`), and a Menu item whose submenu is open takes the press step again.
