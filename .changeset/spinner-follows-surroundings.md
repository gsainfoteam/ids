---
'@gsainfoteam/ids-react': minor
---

Spinner follows its surroundings: without `size` it takes the icon size of the Button or
IconButton it sits in, the size of a surrounding `Field`, or else the text size. A standalone
spinner writes its label into its `role="status"` region a moment after it appears so screen
readers announce it once, and it goes quiet by itself inside a button, link, label or live
region so it never leaks into their name. Under reduced motion it pulses instead of freezing.
The label defaults to `불러오는 중` and `className` may read the spinner state.

Breaking: the root is now the `<svg>` (ref, className and props go there) followed by a
visually hidden status span, instead of a wrapping span. `label` is replaced by `aria-label`.
`size` no longer defaults to `standard`, and `standard` / `tiny` now match the icon tokens
(16px / 14px) instead of 20px / 16px. `decorative` defaults to automatic instead of `false`.
