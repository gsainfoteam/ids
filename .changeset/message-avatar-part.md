---
"@gsainfoteam/ids-react": major
---

Message drops `avatar`. The avatar is drawn only where `Message.Avatar` is written.

- `<Message avatar="/jisu.png">` is `<Message><Message.Avatar src="/jisu.png" />…</Message>`.
- `avatar={<Avatar …>…</Avatar>}` is `<Message.Avatar …>…</Message.Avatar>`: the part takes
  Avatar's props and children, and its `name` defaults to the Message's `name`.
