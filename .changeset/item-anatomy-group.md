---
'@gsainfoteam/ids-react': minor
---

Rebuild Item on the shadcn/ui anatomy: `variant` (`ghost` / `outline` / `soft`), an
`Item.Media` `variant` for icon tiles, media that stays on the first line when a description
wraps, descriptions clamped to two lines, and a second `Item.Content` that keeps its width. A row
with `onClick` is a button named by `Item.Title` and described by `Item.Description`; presses on
controls in `Item.Actions` stay with them, and Enter and Space behave like a native button.
`selected` lays a neutral layer over any variant and uses `aria-pressed`, unless `aria-current`
already says it. `Item.Group` renders a `role="list"` `<ul>` that wraps each row in an `<li>` and
shares its `size`, and `Item.Separator` is left out of the list count. `Item.Separator` is a
`Divider`, drawn as an `li` inside a group and as an `hr` on its own. Rows can be `disabled`.

Breaking: the default look is `ghost` (no background) instead of a surface fill, selection and
hover are neutral instead of primary tints, titles wrap instead of truncating, and only
`className`, `style` and `children` take state functions. `Item.PartProps` now also lives as
`Item.Media.Props` and friends.
