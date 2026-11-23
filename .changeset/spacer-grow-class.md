---
"@gsainfoteam/ids-react": major
---

Spacer drops `flex`, and its `className` and `style` no longer take a state function (`Spacer.State` is gone). The share is a `grow-*` class: Spacer grows by `grow` (1) unless the class says otherwise.

```tsx
<Spacer className="grow-2" />
```
