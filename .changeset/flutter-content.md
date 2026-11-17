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
- An `Image` placed directly in `AspectRatio`, `CardMedia` or a media tile of `Item` or `Empty`
  fills it with `BoxFit.cover`, as React's `object-cover` does, unless it sets its own `fit`.

`IdsColorScheme` (`primary`, `secondary`, `tertiary`, `neutral`, `danger`, `success`, `warning`,
`info`) joins the generated enums. The components read their colors, corners, sizes and text styles
from `IdsProvider`, so they follow the theme's palette, radius, corner shape and `scale`, and
`AvatarGroup` takes its `+N` sentence from the provider's translation.

A `squircle` theme no longer multiplies the radius by 1.84. That factor makes a CSS squircle as
deep as a round corner, but Flutter's `RoundedSuperellipseBorder` already is, so `ids.radius` is
now the same number for both corner shapes.

`Interactive` leaves a press to the innermost control: a press on a control inside another
neither presses nor focuses the outer one, and a press that turns into a scroll takes no focus.
