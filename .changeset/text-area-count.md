---
'@gsainfoteam/ids-react': minor
---

TextArea adds `TextArea.Count`: the length against `maxLength`, joined to the textarea's
description, with a polite live region that says how much is left once typing pauses near the
limit. `threshold`, `announce` and state-driven `children` / `className` customize it. TextArea
also takes `onValueChange(value)` next to the native `onChange`, marks the textarea
`data-field-input`, and carries `data-focused`, `data-filled` and `data-readonly` on the shell,
whose `className` / `style` accept a function of that state. A value written without an input
event (react-hook-form `setValue`) is followed too.

Buttons inside the bars now shrink to the 28px (tiny 24px) inset height, with icons lined up
with the typed text, instead of losing all their size, and the bar padding changed with them.
Bars and the count stay neutral in the invalid state. The textarea gets a generated `id` when
none is given. The unexported `useTextAreaContext` is gone.
