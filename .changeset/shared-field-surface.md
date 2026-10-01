---
'@gsainfoteam/ids-react': minor
---

Give every text-like field one shadcn-style surface: a neutral border, a muted `soft` fill and a
borderless `ghost`, with focus and invalid states drawn by `focus-ring`. Popups and option lists
use the neutral border and a muted highlight.

Breaking: the field `variant` values are now `outline` / `soft` / `ghost`. `filled` becomes
`soft`, `unstyled` becomes `ghost`, and `underline` (TextField, TextArea) is removed. This covers
TextField, TextArea, NumberField, PasswordField, TelField, ChipField, Select, DateField,
TimeField, DateTimeField and ColorField's `surfaceVariant`.
