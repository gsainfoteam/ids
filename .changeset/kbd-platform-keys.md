---
'@gsainfoteam/ids-react': minor
---

Kbd draws shortcuts from the same strings hotkey libraries take: `keys="mod+shift+k"` renders
`⇧⌘K` on Apple devices and `Ctrl+Shift+K` elsewhere, with modifiers sorted in each platform's
menu order and a server render that hydrates to the visitor's platform without a mismatch.
Symbols such as `⌘`, `⇧` and `←` are hidden from screen readers and read by name (Korean by
default, overridable through `labels`), including symbols written as children. Adds `Kbd.Group`
for nested `<kbd>` combinations whose `size`, `platform` and `labels` reach the keys inside,
`platform` and `separator` props, size inherited from a surrounding Field, `data-*` attributes,
`Kbd.State` and function `className`. The key cap takes its tint from the surrounding text
color, so it fits on any surface.

Breaking: the key cap drops its border and monospace font for a flat, tinted shadcn-style cap
with the 4px `indicator` radius, and the standard size shrinks from 24px to 20px.
