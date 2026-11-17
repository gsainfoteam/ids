---
"@gsainfoteam/ids-react": minor
---

Add `Message`, one chat message laid out as an `<article>` named by its sender: avatar, header
(name and `<time>`), content, actions and footer, all optional parts. `shape="bubble"` (the default)
wraps the content in a `Bubble` and takes `align` to sit at the start or the end; `shape="plain"`
draws the content at the full width and always sits at the start. A bubbled message puts its
unread count and time beside the bubble. `Message.Group` groups one sender's messages, showing the
avatar and name on the first and the time on the last, and joins their bubbles at the corners they
share. `unread` counts the readers who have not read a message, or draws a dot for a one-to-one chat
when `true`. `status="pending"` fades the bubble and passes a shimmer over it; `status="error"`
rings it in danger, draws a failure `Marker` under it and, with `onRetry`, a resend `IconButton`
beside it. `Message.Actions` is a `ButtonGroup` that holds `Message.Copy` by default.
