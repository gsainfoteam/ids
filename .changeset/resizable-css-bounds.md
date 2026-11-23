---
"@gsainfoteam/ids-react": major
---

Resizable drops `minWidth`, `maxWidth`, `minHeight` and `maxHeight`. The bounds are the element's own CSS `min-width`, `max-width`, `min-height` and `max-height`, given by class or `style`, and they are read again when only the style or class changes. Before the first measurement (server HTML included) the px values in a `style` object set `aria-valuemin` and `aria-valuemax`. The development warning for a minimum above the maximum is gone.

```tsx
<Resizable style={{ minWidth: 240, maxWidth: 640 }} />
<Resizable className="min-h-30 max-h-120" />
```
