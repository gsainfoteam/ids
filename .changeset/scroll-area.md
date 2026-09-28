---
'@gsainfoteam/ids-react': minor
'@gsainfoteam/ids-css': minor
---

Adds `ScrollArea`, an overlay scrollbar over native scrolling. The OS bar is hidden and an IDS bar
is drawn over the content without taking width: `variant` `hover` (default, while pointed at,
scrolled or dragged) / `auto` (on overflow) / `always` (with its track), `size` `standard` (8px) /
`tiny` (6px), `orientation` `vertical` / `horizontal` / `both`, and `asChild`. Parts
`ScrollArea.Viewport` (`asChild` lets a listbox be the scroller), `Scrollbar`, `Thumb` and
`Corner`; a Scrollbar declared before the content sits on the opposite edge, and an orientation
not declared gets a default bar. Dragging the thumb scrolls, pressing the track pages toward the
pointer, the bar ends stay clear of the root's rounded corners, RTL puts the vertical bar on the
left, and a viewport with no focusable content becomes a tab stop when it overflows. States are
`data-overflow-x/y`, `data-hovering`, `data-scrolling`, `data-dragging` and `data-visible`.

Select and ChipField option lists, the field popups (DateField, TimeField, DateTimeField,
ColorField pickers), Menu content, the command palette list, and Dialog and Drawer bodies now
scroll through ScrollArea. Dialog and Drawer keep their padding and gap on an inner viewport, so a
`p-*` or `gap-*` given to `Dialog.Content` / `Drawer.Content` no longer spaces the content.

The CSS package adds the neutral tokens `--ids-color-scrollbar-track`, `-scrollbar-thumb`,
`-scrollbar-thumb-hover` and `-scrollbar-thumb-active`.
