---
"@gsainfoteam/ids-react": minor
---

Add `Breadcrumb` with `List`, `Item`, `Link`, `Page`, `Separator` and `Ellipsis`. It renders a
`nav` landmark named "이동 경로" around an ordered list, marks `Breadcrumb.Page` with
`aria-current="page"` and puts a hidden chevron between items, mirrored in right-to-left pages;
`separator` swaps it for any text or icon, and a written `Breadcrumb.Separator` turns the automatic
ones off. `Breadcrumb.Link` renders an `<a>` and takes a router's Link through `asChild`.
`maxItems` keeps the first item and the last `maxItems - 1` and folds the rest into
`Breadcrumb.Ellipsis`, a Menu whose items are the hidden links; the Ellipsis can also be written by
hand.
