---
"@gsainfoteam/ids-react": major
---

Size comes from the parent. MessageScroller and Resizable (when not `asChild`) fill the width and height their parent gives and can shrink, like Splitter. Tabs, Breadcrumb and Pagination take the parent's full width. Set a size or place one of them by wrapping it in your own element instead of passing `className`:

```tsx
<div className="flex h-96 flex-col">
  <MessageScroller>…</MessageScroller>
</div>
```
