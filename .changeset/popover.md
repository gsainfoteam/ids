---
'@gsainfoteam/ids-react': minor
---

Add `Popover` with `Trigger`, `Content`, `Arrow`, `Title`, `Description` and `Close` parts. The
panel sits beside its trigger (or any `anchor` element) on the chosen `side` and `align`, flips when
there is no room, and points at the trigger with an optional arrow. It leaves focus where it is
unless `initialFocus` names a target, closes on Escape, a press outside, focus leaving or
`Popover.Close`, and returns focus to the trigger only when it was inside. `triggerType="hover"`
opens after `openDelay` and stays open while the pointer travels into the panel; `modal` holds
focus inside and locks the page like a dialog. Popovers opened from popovers stack, and one without
an `open` prop binds to `overlay.open`.
