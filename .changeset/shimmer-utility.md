---
'@gsainfoteam/ids-css': minor
---

Adds the `shimmer` utility: a band of `--ids-color-on-surface` sweeps over text painted in its own
`currentColor`, so contrast never drops below the text's while it streams. It follows the writing
direction, stops under `prefers-reduced-motion`, and reads `--ids-shimmer-color`,
`--ids-shimmer-spread` and `--ids-shimmer-duration`.
