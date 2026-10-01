---
"@gsainfoteam/ids-react": patch
---

Table, and DataTable through it, fades its left and right edges while more columns are hidden past
them (ScrollArea `fade="x"`, 24px or 16px for `tiny`, flipped in right-to-left documents). The top
and bottom do not fade, since the sticky header scrolls in the same viewport and a top fade would
fade it.
