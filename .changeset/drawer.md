---
'@gsainfoteam/ids-react': minor
---

Add `Drawer`, Dialog's sibling that slides in from a `side` (`top`, `right` by default, `bottom`,
`left`) with the same parts plus `Drawer.Handle`. Drag it closed with a finger or a mouse: a flick
or a pull past a quarter of its size closes it, a shorter pull springs back, and pulling the other
way stretches a rubber band. `useDrawer({ snap: { points, value, defaultValue, onValueChange,
fadeFrom } })` (screen fractions or px), handed to the `drawer` prop, stops it at several heights;
the handle steps through them with Enter or Space, and `drawer.snap.setValue` moves it from outside.
The corner X is drawn where `<Drawer.Close />` is written. A modal drawer scales the page behind it
back like an iOS sheet while keeping fixed elements such as `FloatingButton` in place, pushes the
drawer under a newer modal back, and `modal={false}` leaves the page usable.
