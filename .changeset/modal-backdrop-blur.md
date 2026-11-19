---
'@gsainfoteam/ids-react': minor
---

Blur the page behind a modal. The backdrop of Dialog, Drawer, the Menu command palette, the field
popup drawer and the Image viewer now blurs by 4px (`backdrop-blur-xs`) and dims to 40% black
instead of 50%. The blur fades in and out with the backdrop's opacity. A stacked modal's backdrop
stays transparent and does not blur the modal below it.
