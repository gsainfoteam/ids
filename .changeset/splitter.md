---
'@gsainfoteam/ids-react': minor
---

Add `Splitter`, panels side by side (`orientation="horizontal"`) or stacked (`"vertical"`) with
draggable handles between them, on the `@zag-js/splitter` engine. Sizes are percentages:
`defaultValue` / `value` / `onValueChange` take one number per panel, `onValueCommit` fires once
when a drag, a key, the collapse button or a double click ends, and `Splitter.Panel` takes
`defaultSize`, `minSize`, `maxSize`, `collapsible`, `collapsedSize` and `asChild`. A default
`Splitter.Handle` goes between panels that have none. Handles are `separator`s with the APG Window
Splitter keys: arrows move 16px (64px with Shift, flipped in right-to-left), Home and End take the
panel before the handle to its smallest and largest size, Enter folds and unfolds a collapsible
panel, and a double click restores the default layout. Escape during a drag puts the panels back
without a commit. A collapsible panel's handle carries a collapse button, so folding needs no drag.
Default sizes render as `flex-grow` on the server, so nothing moves on hydration, and a layout saved
from `onValueCommit` in a cookie comes back through `defaultValue`.
