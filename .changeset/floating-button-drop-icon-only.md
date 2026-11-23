---
'@gsainfoteam/ids-react': major
---

FloatingButton loses `iconOnly`. The round icon shape is chosen only by whether the children hold visible text. Text drawn by a component (`<Trans />`) cannot be read, so pass the string itself (`{t('compose')}`) for the extended shape.

```tsx
// before
<FloatingButton iconOnly aria-label="작성"><Glyph /></FloatingButton>

// after
<FloatingButton aria-label="작성"><Glyph /></FloatingButton>
```
