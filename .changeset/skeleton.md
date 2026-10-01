---
'@gsainfoteam/ids-react': minor
---

Add `Skeleton`, a placeholder drawn in the shape of content that is still loading. Without
children it draws a `shape`: `rect` (16px of content height, so `h-*`, `aspect-*`, insets and
stretching size it, full width), `circle` (40px, the standard Avatar) or `text` with `lines` (one
`1lh` line box per line holding a `1em` bar, the last of several at 60%), so a text class such as
`text-body-b3-regular` gives it the height of the real text. Shapes are `aria-hidden` spans.

With children, `loading` or `asChild` it wraps: while `loading` (default `true`) the wrapper `div`
is painted at the children's size and gets `aria-busy="true"`, and the children sit invisible and
`inert` in a `display: contents` box; when loading ends only those attributes and classes go away,
so nothing shifts or remounts. `asChild` paints the child element itself through Slot, keeping its
radius and hiding its borders, shadows, text and pseudo-elements, and makes it `aria-busy` and
`inert`. `animation` is `pulse` (default), `wave` (in the reading direction, reversed in RTL) or
`none`, and reduced motion leaves the plain muted fill. Sizes come from `className`; Skeleton has
no live region and no hooks, so the server markup is the hydrated markup.
