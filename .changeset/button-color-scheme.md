---
'@gsainfoteam/ids-react': minor
---

Button gains `colorScheme` (`primary`, `neutral`, `danger`, `success`, `warning`, `info`), which is
independent of `variant`: solid and soft fill with the scheme, outline and ghost stay neutral for
`primary` and `neutral` and take the scheme as their text color otherwise, and the focus ring
follows the scheme. Also adds `asChild` (a link stays a link, a disabled link loses its href and tab
stop, any other element gets button semantics with Enter and Space), `focusableWhenDisabled` for a
button that keeps focus while it shows its loading state, `data-variant` and `data-size`, the
`Button.State`, `Button.Variant` and `Button.ColorScheme` types, and development warnings for a
button nested in a button and for a Button that holds only an icon.

Breaking: inside a ButtonGroup, a Button's own `size` now wins over the group's instead of throwing.
