---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
---

Replace the radius scale with `standard` (10px), `indicator` (4px), `container` (16px) and
`full`, and add the `concentric-p-*` utility: a padded container's corner becomes its content's
corner plus the padding, summed across two nested levels and stopping at `container`. A popover is left out of the containers around it,
while containers inside a popover, or inside a popover in a popover, still add up. The
`xs`/`sm`/`md`/`lg`/`xl` radius tokens are removed.
