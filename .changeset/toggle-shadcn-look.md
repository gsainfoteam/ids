---
'@gsainfoteam/ids-react': minor
---

Toggle takes the shadcn/ui toggle look: an off toggle is quiet (only `outline` draws a border) and
the variant describes the pressed look, a muted fill for `ghost` and `outline`, the theme tint for
`soft` and the theme fill for `solid`. Toggles are tighter than buttons (`px-2`, `px-1.5` for tiny)
and never narrower than they are tall, so an icon-only toggle is square. Adds `colorScheme`,
`asChild`, `focusableWhenDisabled`, `data-variant`, `data-size`, the `Toggle.State`,
`Toggle.Variant` and `Toggle.ColorScheme` types, and development warnings for `pressed` without
`onPressedChange` and for `pressed` together with `defaultPressed`.

Breaking: the default variant is `ghost` instead of `outline`. `onClick` now runs before the state
changes, and `event.preventDefault()` in it keeps the state. Inside a group, a Toggle's own `size`
wins over the group's instead of throwing.
