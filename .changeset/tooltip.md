---
"@gsainfoteam/ids-react": minor
---

Add `Tooltip`, composed from `Trigger`, `Content` (which takes `side`, `align` and
`sideOffset`) and `Arrow`, and `TooltipDelayGroup`. A tooltip opens on mouse hover after a
delay and on keyboard focus, never on touch or on focus that a closing layer returned, and closes
when the pointer or focus leaves, on any press (the trigger included) and on Escape, before the
dialog it sits in. Opening a modal closes every tooltip. It is portaled into the nearest
IdsProvider, shown in the top layer, and described to the trigger through `aria-describedby`.
Tooltips in one group open one at a time, and the next one opens at once while the group is warm.
