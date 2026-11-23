---
'@gsainfoteam/ids-react': major
---

Group, ButtonGroup and ToggleGroup lose `attached`. A group always joins its items; a `gap-*` utility in its `className` spaces them apart instead (responsive and arbitrary values included, `gap-0` stays joined), with the short separator and per-item shadows the spaced group had before. Message.Actions, Questionnaire and the booking block use `gap-2`.

```tsx
// before
<ButtonGroup attached={false} aria-label="필터">…</ButtonGroup>
<ToggleGroup attached={false} className="flex-wrap" aria-label="시간">…</ToggleGroup>

// after
<ButtonGroup className="gap-2" aria-label="필터">…</ButtonGroup>
<ToggleGroup className="flex-wrap gap-2" aria-label="시간">…</ToggleGroup>
```
