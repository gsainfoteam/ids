---
'@gsainfoteam/ids-react': major
---

Spinner replaces `decorative` with the native `aria-hidden`. `aria-hidden` keeps it silent, `aria-hidden={false}` announces it even inside a button, and leaving it out still decides from the surroundings. The svg stays hidden from screen readers either way.

```tsx
// before
<Spinner decorative />
<Spinner decorative={false} />

// after
<Spinner aria-hidden />
<Spinner aria-hidden={false} />
```
