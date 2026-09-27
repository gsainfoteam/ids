---
'@gsainfoteam/ids-react': minor
---

FloatingButton moves onto the shared button behaviour and the variant and colorScheme axes. It
takes `variant` `solid`, `soft` or `outline` with any `colorScheme`, and every fill is opaque so
nothing shows through while content scrolls underneath. An icon-only button without `aria-label`
is named from its icon the way IconButton is. Placements follow the reading direction and take
the matching safe-area inset on each side, the press scale runs only when motion is allowed, the
button is left out of print, a Spinner takes the icon size, and `focusableWhenDisabled` keeps focus
through a loading state. The development warning for two buttons at one placement now fires only
when they actually overlap.

Breaking: `tone` is removed; use `variant="soft"` for `weak` and `colorScheme="neutral"` for
`contrast`. `variant="surface"` is renamed `outline`. In a right-to-left page `bottom-right` now
sits at the bottom left, the end side.
