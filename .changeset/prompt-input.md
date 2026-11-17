---
'@gsainfoteam/ids-react': minor
---

Add PromptInput, a chat input built from TextArea and FileField: Enter sends (never while an IME composes), Shift+Enter breaks the line, attachments list in the top bar, `PromptInput.Tool` toggles go out with each message as `tools`, `PromptInput.ActionMenu` opens a + menu, and the send button turns into a stop button while `status` is busy. TextArea takes `divided={false}` to drop the line between its bars and the input.
