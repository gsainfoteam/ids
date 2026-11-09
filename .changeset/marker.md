---
'@gsainfoteam/ids-react': minor
---

Adds Marker, a muted line inside a conversation: a status row, a system note or a date separator.
`variant` is `default`, `underline` or `separator` (decorative Divider lines around a paragraph),
`size` is `standard` or `tiny`, and `pending` puts a Spinner first, runs `shimmer` over the text
and makes the paragraph `role="status"`. Icons come in as children; `asChild` draws the line as a
link or a button that keeps its own role.
