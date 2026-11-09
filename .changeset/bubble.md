---
'@gsainfoteam/ids-react': minor
---

Add `Bubble`, a chat bubble. `align` narrows the tail corner without moving the bubble, `variant`
is `soft`, `solid` or `outline`, and `--bubble-max-width` caps it at 80% of its row by default.
When the text wraps, `text-wrap: balance` evens out the lines and the box shrinks to the longest
one, measured with `Range.getClientRects()` after the browser lays it out, for every bubble in one
layout pass. `Bubble.Reactions` as the last child overlaps the bottom corner
away from the tail.
