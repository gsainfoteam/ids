---
'@gsainfoteam/ids-react': minor
---

Loading buttons composed from `disabled` and `<Spinner />` now read as an icon swap. A Spinner
inside a Button, IconButton or Toggle takes the control's icon size (16px standard, 14px tiny)
instead of its own 20px/16px, a leading or trailing decorative Spinner trims the padding on its
side the way an icon does, and a control with `aria-busy="true"` shows the progress cursor
instead of not-allowed while it is disabled.
