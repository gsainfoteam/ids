---
'@gsainfoteam/ids-react': minor
---

`ScrollArea.Corner` takes content. A Corner with children occupies its corner the way a native
resizer sits under the native scrollbar: it shows even with one bar or no overflow, is no longer
`aria-hidden`, sits flush in the root's corner and is sized by its content, and a bar that ends at
that corner stops a gap short of it. Content that must stay inside a rounded corner draws itself
there. A Corner without children behaves as before.
