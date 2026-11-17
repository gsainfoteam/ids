---
"@gsainfoteam/ids-react": minor
---

Add `Message`, one chat message laid out as an `<article>` named by its sender: avatar, header
(name and `<time>`), content, actions and footer, all optional parts. `from="user"` sits on the end
and wraps its content in a `Bubble`; `align` places a message in a chat between people.
`Message.Group` groups one sender's messages, showing the avatar and name on the first and the time
on the last. `status` adds `'read'` to the footer, and `'error'` draws a failure `Marker` with a
resend `Button` when `onRetry` is given. `Message.Actions` is a `ButtonGroup` that holds a copy
button by default.
