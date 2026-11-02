---
'ids_flutter': minor
---

Add `IdsDivider`, `IdsSpinner`, `IdsLabel` and `IdsField` (with `IdsFieldLabel`,
`IdsFieldDescription`, `IdsFieldHint` and `IdsFieldError`), the first components after the
package was cleared for the rebuild. They follow the React components: Divider draws a 1px
neutral line with an optional centered label, Spinner takes its size and color from `IconTheme`
unless given `IdsSize.standard` or `tiny`, and Field hands `size`, `required`, `disabled` and
`invalid` down to its parts, hiding the hint while the field is invalid.

`ThemeProvider` now sets the default text and icon color to `onSurface`, so widgets that follow
the surrounding color stay visible in dark mode. `IdsTheme` gains `border` and `danger`.
