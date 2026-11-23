---
"@gsainfoteam/ids-react": major
---

Breadcrumb drops `separator`. Write `Breadcrumb.Separator` between the items instead; a written separator turns the automatic chevrons off. `maxItems` now also folds a trail with written separators, dropping the separators in front of the hidden items.

```tsx
<Breadcrumb>
  <Breadcrumb.Item>…</Breadcrumb.Item>
  <Breadcrumb.Separator>/</Breadcrumb.Separator>
  <Breadcrumb.Item>…</Breadcrumb.Item>
</Breadcrumb>
```
