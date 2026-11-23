---
"@gsainfoteam/ids-react": major
---

`Popover.Content` takes the width of what it holds instead of a fixed `w-72`. `Popover.Title` and `Popover.Description` still wrap at 18rem; for a wider or fixed popup, wrap the content in your own element instead of passing `className`.

```tsx
<Popover.Content>
  <div className="grid w-80 gap-3">…</div>
</Popover.Content>
```
