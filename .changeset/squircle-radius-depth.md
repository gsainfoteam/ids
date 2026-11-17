---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
---

A `squircle` theme multiplies every radius, `concentric-p-*` included, by 1.84 so its corners are as
deep at 45° as a round corner of the same radius, instead of looking square. The provider writes
`--ids-theme-corner-radius-scale`; browsers without `corner-shape` keep the round radius.
