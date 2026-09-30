---
'@gsainfoteam/ids-react': minor
---

`ScrollArea.Corner` takes content. A Corner with children occupies its corner the way a native
resizer sits under the native scrollbar: it shows even with one bar or no overflow, is no longer
`aria-hidden`, sits inside the root's rounded corner, and a bar that ends at that corner stops a
gap short of it. A Corner without children behaves as before.
