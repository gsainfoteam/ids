---
'@gsainfoteam/ids-react': patch
---

`<Field>` no longer counts the controls inside an open popup (a ColorPicker's input and swatches,
a Select's search box) as its value, so `data-filled` and `data-dirty` stay put while the popup is
open.
