---
'@gsainfoteam/ids-react': major
---

Toaster loses `gap`, `offset` and `expand`. The spacing between toasts and the distance from the screen edge are the CSS variables `--toaster-gap` (14px) and `--toaster-offset` (24px), set through `style` or `className`. `expand` becomes `variant="expanded"`; the default is `variant="stacked"`.

```tsx
// before
<Toaster gap={8} offset={32} expand />

// after
<Toaster
  variant="expanded"
  style={{ '--toaster-gap': '8px', '--toaster-offset': '32px' } as CSSProperties}
/>
```
