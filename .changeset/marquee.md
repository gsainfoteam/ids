---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
---

Add Marquee, a strip that loops its content in one direction with a CSS animation: the content is
drawn twice and the new `ids-marquee` keyframes (`animate-marquee`) move the track by half its
length, so the server HTML flows before any JavaScript runs. `speed` is `slow` / `normal` /
`fast` or pixels per second; a ResizeObserver turns the measured length into the loop time, which
starts at 1000px before the first measurement. It takes `orientation` (`horizontal`, flowing the
other way in right-to-left documents, or `vertical`), `reverse`, `fade` (a `mask-image` gradient)
and `size` for the pause control. The gap comes from `gap-*` on the root and is the same between
items and between the two copies. The copy is `aria-hidden` and `inert`, so screen readers read
each item once and Tab stops once; keyboard focus moves the focused item to the middle of the
strip, and a pointer over the copy swaps the copies so the item under it can be clicked.
`Marquee.Pause`, an IconToggle named by the `marquee.pause` message, is drawn by default for WCAG
2.2.2 (`pauseControl={false}` removes it) and stays pressed until pressed again, driven by
`playing` / `defaultPlaying` / `onPlayingChange`; `pauseOnHover` and `pauseOnFocus` pause only
while the pointer or keyboard focus stays. Under `prefers-reduced-motion`, or `reducedMotion`, the
items wrap in place with no copy and no button; `reducedMotion={false}` keeps it moving for an app
with its own motion setting. The root is `role="group"` and warns in development without a name.
`Marquee.Item` keeps an item on one line and takes `asChild`. A new `useReducedMotion` hook reads
the preference after hydration.
