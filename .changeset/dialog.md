---
'@gsainfoteam/ids-react': minor
---

Add `Dialog` with `Trigger`, `Content`, `Header`, `Title`, `Description`, `Footer`, `Close` and
`Overlay` parts, and `overlay.open` to open one from anywhere and await the value it is closed
with (`undefined` when dismissed). A dialog holds focus inside, returns it to where it came from,
hides and scroll-locks the page under it, and closes on Escape (not while composing), a backdrop
click or `Dialog.Close`; `dismissible={false}` and `role="alertdialog"` keep it open until a
button answers. Dialogs opened from dialogs stack, and the lower one steps back. `useOverlay()`
opens in the caller's theme; `overlay.close`, `overlay.closeAll` and `overlay.unmount` close from
outside.
