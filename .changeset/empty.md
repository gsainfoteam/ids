---
'@gsainfoteam/ids-react': minor
---

Add `Empty`, an empty-state block with `Empty.Media`, `Empty.Title`, `Empty.Description` and
`Empty.Actions`. It is static content with no role or live region. Without `Empty.Media` it draws
an inbox icon in a soft square (`<Empty.Media hidden />` removes it); `Empty.Media` takes
`variant` `soft` / `outline` / `ghost` for icons and illustrations. The root takes `variant`
`ghost` / `soft` / `outline` (dashed neutral border), `size` `standard` / `tiny` and `align`
`center` / `start`, with concentric padding. Every part takes `asChild`, so the title can be a
heading. A missing `Empty.Title` warns in development.
