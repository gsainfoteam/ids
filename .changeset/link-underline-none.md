---
"@gsainfoteam/ids-react": minor
---

`Link` gains `underline="none"` for a menu of links such as a top bar, and a `neutral` Link whose `aria-current` is `page` takes the primary text color, so React Router's `NavLink` and TanStack Router's `Link`, which set `aria-current` themselves, mark the current page on their own; with Next.js's `Link` the app sets `aria-current` from `usePathname()`. The new `Blocks/TopBar` stories build a top bar from Link, Drawer and Item.
