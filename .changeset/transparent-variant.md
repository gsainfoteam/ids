---
'@gsainfoteam/ids-react': minor
'ids_flutter': minor
---

Add the `transparent` variant to Button, IconButton and IconToggle. It draws no background and no
border, and paints none on hover or press either: hover lowers the opacity to 70% and press to 40%,
in every color scheme. A transparent IconToggle keeps its icon `on-surface` while off and turns
only the icon to the color scheme's `text-X` role while on, so `colorScheme="danger"` gives a red
heart, and it fades on hover and press while on as well. Toggle, Group, ToggleGroup, Pagination, Tabs and the Carousel and Image buttons do not take
`transparent`.

ids_flutter adds `transparent` to the generated `IdsVariant` enum.
