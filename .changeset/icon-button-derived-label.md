---
'@gsainfoteam/ids-react': minor
---

IconButton names itself from its icon when `aria-label` is omitted: the icon's own `aria-label` or
`title` first, then its component name (`displayName`, or a function name ending in `Icon`), so
`<PlusIcon />` gives "Plus" and `ChevronDownIcon` gives "Chevron down". An explicit `aria-label`,
`aria-labelledby` or `title` always wins. IconButton also gains `colorScheme`, `asChild` (the icon
can live inside the child link), `focusableWhenDisabled`, `data-variant`, `data-size` and the
`IconButton.State`, `IconButton.Variant` and `IconButton.ColorScheme` types, and is drawn from the
control surface directly, so the square stays exact with a Spinner or any icon inside.

Breaking: a missing `aria-label` no longer throws; the name is derived, and a development warning
fires when none can be found. Inside a ButtonGroup an IconButton's own `size` now wins over the
group's instead of throwing.
