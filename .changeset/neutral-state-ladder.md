---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
---

Add the neutral state steps `--ids-color-muted-hover`, `-muted-active`, `-handle`,
`-handle-hover` and `-handle-active` (`bg-muted-hover`, `bg-handle` and so on). Neutral states
climb one step at a time: a transparent control hovers to `muted` and presses to `muted-hover`, a
filled control goes `muted`, `muted-hover`, `muted-active`, and a handle goes `handle`,
`handle-hover`, `handle-active` while dragged.
