---
"ids_flutter": minor
---

Add the content components: `AspectRatio`, `Skeleton`, `Avatar`, `AvatarGroup`, `Badge`, `Card`,
`Empty` and `Item` (with `ItemGroup` and `ItemSeparator`), and re-export Flutter's `Spacer`. Their
API, states and values follow the React components. Parts are separate classes passed as
`children` (`CardHeader`, `EmptyTitle`, `ItemMedia`), and components carry no `Ids` prefix, so an
app that also imports Material imports the package `as ids`.

- `Skeleton` draws a `rect`, `circle` or `text` shape, or wraps a child with `loading` and paints
  over it while keeping its layout and state.
- `Avatar` shows an image, then initials from `name`, then a person icon, and `AvatarGroup`
  overlaps avatars with a transparent gap and counts the rest as `+N`.
- `Badge`, `Badge.count` and `Badge.dot` sit on the corner of their `child` or stand in place
  without one, and grow with the system text size.
- A `Card` or `Item` with `onPressed` presses anywhere on its surface, while a control inside
  keeps its own press and focus. `Item` takes `selected`, and `ItemGroup` reads as a list.

`IdsColorScheme` (`primary`, `neutral`, `danger`, `success`, `warning`, `info`) joins the generated
enums. Neutral colors are generated with the brand colors, `IdsTheme` gains `mutedHover` and the
`success`, `warning`, `danger` and `info` families with their `on` and `strong` tones, and
`IdsRadius` holds the radius scale.

`Interactive` leaves a press to the innermost control: a press on a control inside another
neither presses nor focuses the outer one, and a press that turns into a scroll takes no focus.
