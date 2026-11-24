---
'@gsainfoteam/ids-react': minor
---

Sidebar and Scheduler read their height from a CSS variable on a wrapping element, so a page
frames them without a `className`: `--sidebar-height` (default `100dvh`, also the Provider's
minimum height) and `--scheduler-height` (default `36rem`).
