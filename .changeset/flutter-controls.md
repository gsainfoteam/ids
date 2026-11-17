---
"ids_flutter": minor
---

Add `Divider`, `Spinner`, `Label` and `Field` (with `FieldLabel`,
`FieldDescription`, `FieldHint` and `FieldError`), the first components after the
package was cleared for the rebuild. Their API follows the React components and their look
follows Figma. Divider draws a 1px neutral line with an optional centered label, and Spinner
takes its color from `IconTheme` and, unless given `IdsSize.standard` or `tiny`, the size of the
`Field` around it, then of an icon theme that sets one, then of the surrounding text. Field
hands `size`, `required`, `disabled` and `invalid` down to its parts: disabled fades the whole
field, and invalid swaps the hint for the error while the label keeps its color.

`ThemeProvider` now sets the default text and icon color to `onSurface`, so widgets that follow
the surrounding color stay visible in dark mode. `IdsTheme` gains `border` and `danger`.
