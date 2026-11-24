---
'@gsainfoteam/ids-react': patch
'@gsainfoteam/ids-css': patch
---

A submit Button with `disabled={pending}` from `useFormStatus` stays disabled while the action
runs, pressed with the mouse or with Enter. Once disabled, the button still gets the blur or the
Enter keyup, and its interaction state update re-rendered inside the form, which React 19.2 reads
as `pending: false`. Interaction state on a natively disabled element now updates in a transition,
after the action. `focus-ring` no longer draws a ring for `[data-focus-visible]` on a `:disabled`
element, so the ring leaves with the focus while that update waits.
