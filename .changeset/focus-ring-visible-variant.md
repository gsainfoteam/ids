---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': patch
---

The CSS package adds a `focus-ring-visible:` variant that matches exactly when `focus-ring` draws its
ring. Group, OTPField and Calendar raise the ringed item with it, so a TextField joined in a
ButtonGroup no longer has its ring covered by the button after it, and a focused item stays above a
hovered or pressed one.
