---
'@gsainfoteam/ids-react': minor
---

Add `step` and `getValueLabel` to `Resizable`. `step` snaps a drag to its multiples and moves the
arrow keys one step (four with Shift); `getValueLabel(size, dimension)` becomes the separator's
`aria-valuetext` in place of the pixel value.
