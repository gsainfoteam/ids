---
'@gsainfoteam/ids-react': minor
---

Rebuild AvatarGroup: overlapping avatars are cut out where their neighbour covers them, so the
gap shows the real background on any surface, including square avatars' rounded corners and
right-to-left text. `stacking` picks whether the first or the last avatar sits on top, `total`
counts people that were not rendered, `shape` joins `size` in reaching every avatar, and
`AvatarGroup.Overflow` can move or redraw the `+N`, which is now an image named "외 N명"
(`overflowLabel` to change it) that shrinks for three-digit counts.

Breaking: `variant` is renamed `layout` (`stack` / `inline`). The surface-colored ring around
stacked avatars is replaced by the transparent cut-out. Children may be any element wrapping an
avatar, and `max` below 1 is clamped instead of throwing.
