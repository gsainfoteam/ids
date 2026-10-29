---
"@gsainfoteam/ids-react": minor
---

Defaults follow how IDS is used, so screens write fewer props.

- Badge on its own defaults to `neutral`; a Badge attached to an element keeps `danger`, the color of
  a count.
- Toggle and IconToggle default to `outline`, Empty to `outline` and `Item.Group` to `bordered`.

Breaking: these components look different where they relied on the old default. Pass
`variant="ghost"` (or `colorScheme="danger"` on a standalone Badge) to keep the old look.
