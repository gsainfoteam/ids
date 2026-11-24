---
'@gsainfoteam/ids-react': patch
---

A submit Button with `disabled={pending}` from `useFormStatus` stays disabled while the action
runs. The browser blurs a focused button when it becomes disabled, and the Button's focus state
update re-rendered inside the form, which React 19.2 reads as `pending: false`. Interaction state
on a natively disabled element now updates in a transition, after the action.
