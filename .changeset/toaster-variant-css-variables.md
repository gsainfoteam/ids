---
'@gsainfoteam/ids-react': major
---

Toaster loses `gap`, `offset` and `expand`. The spacing between toasts and the distance from the screen edge are the CSS variables `--toaster-gap` (14px) and `--toaster-offset` (24px), set on an element that wraps the Toaster and inherited. `expand` becomes `variant="expanded"`; the default is `variant="stacked"`.

```tsx
// before
<Toaster gap={8} offset={32} expand />

// after
<div className="[--toaster-gap:8px] [--toaster-offset:32px]">
  <Toaster variant="expanded" />
</div>
```
