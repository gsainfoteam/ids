---
'@gsainfoteam/ids-css': minor
---

Ship the `dark:` variant with the CSS package and drive it from `data-mode` instead of the OS
color scheme, so `dark:*` classes follow `IdsProvider`. A light region nested inside a dark
one no longer matches `dark:`.
