---
"@gsainfoteam/ids-react": minor
---

`Item.Group` takes `variant`: `ghost` (the default, unchanged), `bordered` draws a seam between
rows and squares their corners, and `separated` spaces rows 8px apart as outlined cards, which a
row's own `variant` still overrides. `ordered` renders an `<ol>` so a screen reader reads the order;
numbers are not drawn. The group's `ref` is typed `Ref<HTMLElement>` to cover both lists.
