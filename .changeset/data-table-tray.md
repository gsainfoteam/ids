---
'@gsainfoteam/ids-react': minor
---

DataTable `outline` sets the table card on a `bg-neutral-soft` tray (`concentric-p-1`) and puts the
selection count and the page buttons on the tray's bottom line, with `border-neutral` lines between
columns. A sort button now spans its header cell with the icon at the end: the unsorted icon shows
only on hover or focus, and a sorted column's arrow is `text-primary`. A header may hold an icon
next to its text. `ghost` keeps the plain table.

Table rows are denser (standard cells 16px × 10px under a 40px header, tiny 12px × 6px under 32px),
the `outline` header row is no longer filled, and a selected row is `bg-primary-soft` with
`text-on-primary-soft` instead of `bg-neutral-soft-hover`, ahead of a stripe.
