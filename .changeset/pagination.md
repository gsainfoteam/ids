---
"@gsainfoteam/ids-react": minor
---

Add `Pagination` with `List`, `Item`, `Link`, `Previous`, `Next` and `Ellipsis`. It takes `page`,
`defaultPage`, `onPageChange` and `pageCount`, and collapses far pages into an ellipsis around
`siblingCount` pages beside the current one and `boundaryCount` pages at each end, always in the
same number of slots. Without `getHref` it draws buttons; with it every page is an `<a href>`, and
a router `Link` goes inside `Pagination.Link`, `Previous` or `Next` through `asChild`, with
`Pagination.List` taking a function of each entry. It is a named `<nav>` list with
`aria-current="page"` and translated names, ArrowLeft and ArrowRight step a page and Home and End
jump to the ends, and `size` and `variant` follow Button.
