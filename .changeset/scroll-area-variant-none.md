---
'@gsainfoteam/ids-react': minor
---

ScrollArea takes `variant="none"`, which never draws the scrollbar or the Corner, even on hover, while
scrolling or dragging. Scrolling, `fade`, `data-overflow-*` and `--scroll-area-overflow-*` work as with
the other variants, so a horizontal toolbar can scroll sideways with only the edge fade as its cue.
