---
'@gsainfoteam/ids-react': patch
---

Editor's link and image forms no longer submit on the Enter that confirms Korean or Japanese input in Safari. The Escape that ends that input no longer goes to the layers. Safari reports both keys with `keyCode` 229 and `isComposing: false`.
