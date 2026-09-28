---
"@gsainfoteam/ids-react": minor
"@gsainfoteam/ids-css": minor
---

Adds `ScrollArea`, an overlay scrollbar over native scrolling. The OS bar is hidden and an IDS bar
is drawn over the content without taking width: `variant` `hover` (default, while pointed at,
scrolled or dragged) / `auto` (on overflow) / `always` (with its track), `size` `standard` (8px) /
`tiny` (6px), `orientation` `vertical` / `horizontal` / `both`, and `asChild`. Parts
`ScrollArea.Viewport` (`asChild` lets a listbox be the scroller), `Scrollbar`, `Thumb` and
`Corner`; a Scrollbar declared before the content sits on the opposite edge. Without
`orientation` the declared Scrollbars decide the directions; with it, an orientation not declared
gets a default bar. Dragging the thumb scrolls, pressing the track pages toward the
pointer, the bar ends stay clear of the root's rounded corners, RTL puts the vertical bar on the
left, and a viewport with no focusable content becomes a tab stop when it overflows. States are
`data-overflow-x/y`, `data-hovering`, `data-scrolling`, `data-dragging` and `data-visible`.

Select and ChipField option lists, the field popups (DateField, TimeField, DateTimeField,
ColorField pickers), Menu content, the command palette list, Dialog, Drawer and Popover bodies,
TextArea and the TimePicker columns now scroll through ScrollArea. Popover now caps its height at
the space left on screen and scrolls past it. Dialog, Drawer and Popover keep their padding and
gap on an inner viewport, so a
`p-*` or `gap-*` given to `Dialog.Content`, `Drawer.Content` or `Popover.Content` no longer spaces the content.

The CSS package adds the neutral tokens `--ids-color-scrollbar-track`, `-scrollbar-thumb`,
`-scrollbar-thumb-hover` and `-scrollbar-thumb-active`.
