---
"@gsainfoteam/ids-react": minor
---

`ScrollArea` takes `fade` (`true` for every axis it scrolls along, `'y'` or `'x'`; off by
default) to fade the viewport's content at an edge only while there is more to scroll to on that
side. The fade is a `mask-image` gradient whose length on each edge is the distance hidden past it,
up to `--scroll-area-fade-size` (24px, 16px for `tiny`), so it grows in from 0 as the content
scrolls away from an edge instead of popping in. The bars sit outside the viewport and never fade,
two axes intersect, the x axis flips in right-to-left documents, and a tab-stop viewport drops the
fade while its focus ring shows. With or without `fade`, the viewport now carries the logical
distances as `--scroll-area-overflow-y-start`, `-y-end`, `-x-start` and `-x-end` (px, registered as
non-inherited lengths so a scroll frame restyles only the viewport) and the matching
`data-overflow-*` attributes while a distance is above 0. They are written with the thumbs on scroll
and resize and are absent from the server HTML and the first client render.
