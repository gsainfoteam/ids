---
'ids_flutter': minor
---

Add `IdsDivider`, `IdsSpinner`, `IdsLabel` and `IdsField` (with `IdsFieldLabel`,
`IdsFieldDescription`, `IdsFieldHint` and `IdsFieldError`), the first components after the
package was cleared for the rebuild. Their API follows the React components and their look
follows Figma. Divider draws a 1px neutral line with an optional centered label, and Spinner
takes its size and color from `IconTheme` unless given `IdsSize.standard` or `tiny`. Field
hands `size`, `required`, `disabled` and `invalid` down to its parts: disabled fades the whole
field, and invalid swaps the hint for the error while the label keeps its color.

`ThemeProvider` now sets the default text and icon color to `onSurface`, so widgets that follow
the surrounding color stay visible in dark mode. `IdsTheme` gains `border` and `danger`.
