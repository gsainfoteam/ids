---
'@gsainfoteam/ids-react': minor
---

Give Badge a `variant` (`solid` / `soft` / `outline`) alongside `colorScheme`, with an opaque
soft fill so a badge never shows what it covers. A labelled badge is a live region that reads its
sentence when the count changes, and an unlabelled count becomes the `aria-describedby` of the
element it is attached to. A zero or `invisible` badge stays mounted and scales out, so it animates
back and keeps announcing. Badges on a round Avatar find the circle's edge on their own, badges
without children render inline, and `className` / `style` take the badge state.

Breaking: `placement` values are logical: `top-right` / `top-left` / `bottom-right` /
`bottom-left` become `top-end` / `top-start` / `bottom-end` / `bottom-start` and flip in
right-to-left text. The neutral scheme's solid fill is now the inverted on-surface color (the
muted look moves to `soft`), the standard count uses 12px text, and a badge without `content` or
`dot` warns in development instead of throwing.
