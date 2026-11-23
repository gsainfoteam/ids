---
"@gsainfoteam/ids-react": minor
---

Add `Skeleton`, which paints content that is still loading in its own shape. It always wraps its
children (`children` is required): render the real component with placeholder data and wrap it, so
its own size, radius and text style give the painted box.

While `loading` (default `true`) the wrapper `div` is painted at the children's size and gets
`aria-busy="true"`, and the children sit invisible and `inert` in a `display: contents` box; when
loading ends only those attributes and classes go away, so nothing shifts or remounts. `asChild`
paints the child element itself through Slot, keeping its radius and hiding its borders, shadows,
text and pseudo-elements, and makes it `aria-busy` and `inert`. `animation` is `pulse` (default),
`wave` (in the reading direction, reversed in RTL) or `none`, and reduced motion leaves the plain
muted fill. Skeleton has no live region and no hooks, so the server markup is the hydrated markup.

```tsx
<Skeleton loading={isLoading} asChild>
  <Avatar name={user?.name ?? '김지스트'} />
</Skeleton>
<Skeleton loading={isLoading}>
  <p className="text-body-b3-regular">{post?.summary ?? '수강 신청은 9월 1일에 열립니다.'}</p>
</Skeleton>
```
