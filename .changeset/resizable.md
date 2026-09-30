---
'@gsainfoteam/ids-react': minor
---

Add `Resizable`, which resizes one element with a handle, the way a `<textarea>` grip does, for
any element. `direction` (`both` / `horizontal` / `vertical`) picks the handle: a corner grip that
is one tab stop holding a width and a height separator (arrows resize an axis and move focus to its
separator), or an edge handle for one axis. The edge handle is a short pill on the edge line; the
corner grip is the same pill bent into an arc concentric with the element's own corner radius, read
from `border-end-end-radius` (an L with a small rounding on a square corner), with its focus halo
and 24px target following the arc. `width` / `defaultWidth` / `onWidthChange` and
`height` / `defaultHeight` / `onHeightChange` take px, bounded by `minWidth`, `maxWidth`,
`minHeight`, `maxHeight` and the element's own px CSS limits. Arrows step 16px and Shift 64px, Home
and End go to the bounds, Enter and a double click return to the first size, and Escape during a
drag restores it. A drag writes the size once per frame and reports it once when released; handles
take a 24px target, `asChild` resizes the child itself, and `Resizable.Handle` replaces the default
handle.

DataTable's column resize handle now has a 24px target and shows the focus ring.
