---
'@gsainfoteam/ids-react': patch
---

Chart's tooltip follows the last input. Tab, the arrow keys and Enter now show the datum the
keyboard picked even while the pointer rests on the graph; before, Recharts kept the tooltip on the
datum under the pointer and the keys moved nothing visible. Moving the pointer brings the tooltip
back under it.
