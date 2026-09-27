---
'@gsainfoteam/ids-react': minor
---

Rebuild Card on the shadcn/ui anatomy: `Card.Action` sits in the header's end corner, and
`Card.Media` bleeds to the edge with the card's concentric corner without covering the outline.
A card with `onClick` is a button named by `Card.Title` and described by `Card.Description`;
Enter presses on key down, Space on key up, and clicks or keys that start on a control inside the
card no longer trigger it. `asChild` links and buttons become interactive on their own, `disabled`
takes a card out of the tab order, and `size="tiny"` tightens the padding. Header and footer
borders run the full width. Hover and press lay a neutral layer over any variant.

Breaking: `variant` is now `outline` / `soft` / `ghost`: `filled` becomes `soft` and `elevated`
is removed (add a shadow through `className`). The outline uses the neutral border color with
`shadow-xs`, and hover no longer tints the card with the primary color. Only `className`, `style`
and `children` take state functions. Part prop types move to `Card.Header.Props` and friends.
