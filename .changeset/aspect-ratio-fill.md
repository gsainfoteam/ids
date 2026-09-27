---
'@gsainfoteam/ids-react': minor
---

AspectRatio makes its children fill the box and crops `img` / `video` with `object-cover`, both at
zero specificity so a size or `object-fit` class on the child still wins. Adds
`data-aspect-ratio`, `AspectRatio.State` and function `className` / `style`.

Breaking: a direct child without its own size now fills the box instead of keeping its natural
size.
