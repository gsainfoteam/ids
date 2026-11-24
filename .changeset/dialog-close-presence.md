---
"@gsainfoteam/ids-react": major
---

Dialog drops `hideClose`. Whether the corner close button is drawn follows what the app writes.

- `Dialog.Content` draws the corner X only when its children hold no `Dialog.Close`. A footer
  `<Dialog.Close>취소</Dialog.Close>` or `<Dialog.Close asChild>` now replaces the X, so
  `<Dialog hideClose>` around such a footer needs no change beyond removing the prop.
- To keep the X beside footer buttons, write `<Dialog.Close />` (no children) as a child of
  `Dialog.Content`. It is drawn in the corner.
- `Dialog.Close` is found in `Dialog.Content`'s children, Fragments, HTML elements,
  `Dialog.Header` and `Dialog.Footer`, not inside other components or a nested `Dialog`.
