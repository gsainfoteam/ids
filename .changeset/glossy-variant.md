---
'@gsainfoteam/ids-react': minor
'ids_flutter': minor
---

Add the `glossy` variant. It lays a highlight over the `solid` fill: a top-lit gradient, a 1px
inner highlight, an edge 20% darker than the fill and a small drop shadow. Hover brightens the
gradient; press drops the gradient and the shadow and sinks the button with an inner shadow; focus
turns the edge into the scheme's ring color. Button, IconButton, Toggle, IconToggle, ButtonGroup
and ToggleGroup take it through `IdsVariant`, and a glossy toggle is transparent while off and
glossy while pressed. FloatingButton adds `glossy` to its own variants and keeps its opaque fill and
`shadow-lg`. Joined glossy buttons overlap their edges like `outline`, and the group draws one
shadow around them instead of one per button.

ids_flutter adds `glossy` to the generated `IdsVariant` enum.
