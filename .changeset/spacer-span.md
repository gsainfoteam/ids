---
'@gsainfoteam/ids-react': minor
---

Spacer renders a `<span>`, so it is valid inside a Button, link or label, and warns in
development when its parent is not a flex container. Adds `data-spacer`, `Spacer.State` and
function `className` / `style`.

Breaking: the element and its ref type change from `div` / `HTMLDivElement` to `span` /
`HTMLSpanElement`.
