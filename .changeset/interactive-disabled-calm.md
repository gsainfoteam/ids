---
'@gsainfoteam/ids-react': patch
---

A control that turns disabled under the pointer or while it is being pressed drops its hover and
pressed look at once (`data-hovered`, `data-active`), instead of keeping it until the pointer
moves. Calendar's month buttons, which disable themselves on reaching the last month, relied on
this.
