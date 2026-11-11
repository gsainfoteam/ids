---
'@gsainfoteam/ids-react': minor
---

Add `MessageScroller`, a message list that follows new messages at the end and stops while the reader scrolls up, selects text or presses PageUp, Home or ArrowUp. `scrollOnAppend="start"` holds a new turn at the top for AI chats, `onReachStart` and `loading` load earlier messages without moving the one being read, and a small scroll-to-bottom button centered at the bottom shows how many arrived meanwhile.
