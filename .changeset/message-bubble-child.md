---
'@gsainfoteam/ids-react': major
---

Message loses `shape`. A message is drawn as a bubble only when its body holds a `<Bubble>`, and Message no longer wraps a body in one. `Message.Shape`, `MessageShape` and `data-shape` are gone, and `align` is accepted without a bubble too (the avatar, header and content sit at that end).

A Bubble inside a Message takes the Message's `align` (and so a MessageGroup's) through context. An `align` given to the Bubble still wins, and a Bubble outside a Message stays `start`.

```tsx
// before
<Message align="end">요약해 줘</Message>
<Message shape="plain" name="도우미">답</Message>

// after
<Message align="end">
  <Bubble>요약해 줘</Bubble>
</Message>
<Message name="도우미">답</Message>
```
