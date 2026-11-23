---
'@gsainfoteam/ids-react': major
---

Skeleton only wraps now. `shape` (`rect`, `circle`, `text`), `lines` and `Skeleton.Shape` are gone, and `children` is required: render the real component with placeholder data and wrap it, so its own size, radius and text style give the painted box. `<Skeleton loading>` paints a wrapper `div` at the children's size, `<Skeleton loading asChild>` paints the child element itself, and `loading` still defaults to `true`.

```tsx
<Skeleton loading={isLoading} asChild>
  <Avatar name={user?.name ?? '김지스트'} />
</Skeleton>
<Skeleton loading={isLoading}>
  <p className="text-body-b3-regular">{post?.summary ?? '수강 신청은 9월 1일에 열립니다.'}</p>
</Skeleton>
```
