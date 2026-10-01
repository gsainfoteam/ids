---
'@gsainfoteam/ids-react': patch
---

Classes are merged by [`cn`](https://github.com/shadcn-ui/cn) instead of `clsx` and
`tailwind-merge`, and the style functions run the lite build of `tailwind-variants` through the
same `cn`. A `className` merges as before, except that a later axis utility now replaces the
start/end one it covers: `px-3` after a component's `ps-2.5` wins, as do `mx-*`, `inset-x-*`,
`border-x-*` and `scroll-mx-*`.
