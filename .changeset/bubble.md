---
'@gsainfoteam/ids-react': minor
---

Add `Bubble`, a chat bubble. `align` narrows the tail corner without moving the bubble, `variant`
is `soft`, `solid` or `outline`, and `--bubble-max-width` caps it at 80% of its row by default.
When the text wraps, the box shrinks to its longest line, measured with `Range.getClientRects()`
after the browser lays it out. `Bubble.Reactions` as the last child overlaps the bottom corner
away from the tail.
