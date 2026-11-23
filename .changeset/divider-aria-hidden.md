---
"@gsainfoteam/ids-react": major
---

Divider drops `decorative`. Pass `aria-hidden` instead: a Divider with `aria-hidden` is decorative and carries no `role` or name, and one without it keeps `role="separator"` and its name. `Divider.State` still reports `decorative`, now read from `aria-hidden`.

```tsx
<Divider orientation="vertical" aria-hidden />
```
