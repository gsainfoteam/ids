---
'@gsainfoteam/ids-react': minor
---

Add `Link`, a text link on a native `<a>` with the `focus-ring`. `colorScheme` picks `accent`
(default, the brand text color) or `neutral` (the surrounding text color, for footers and table
cells), and `underline` picks `always` (default) or `hover`. `asChild` renders a router link. With
`target="_blank"` it adds `rel="noopener noreferrer"` unless a `rel` is given, a new tab icon
hidden from screen readers and the hidden text `link.newTab` ("(새 탭에서 열림)").

`Empty.Description` now underlines only a bare `<a>`, so a `Link` inside it keeps its own color,
underline and hover.

`asChild` (Link, Button, Slot and every part that takes it) now keeps a child's `className` and
`style` functions, such as React Router `NavLink`'s `({ isActive }) => ...`, and merges IDS's class
and style into their result instead of dropping them.
