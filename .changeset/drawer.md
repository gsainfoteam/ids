---
'@gsainfoteam/ids-react': minor
---

Add `Drawer`, Dialog's sibling that slides in from a `side` (`top`, `right` by default, `bottom`,
`left`) with the same parts plus `Drawer.Handle`. Drag it closed with a finger or a mouse: a flick
or a pull past a quarter of its size closes it, a shorter pull springs back, and pulling the other
way stretches a rubber band. `snapPoints` (screen fractions or px) with `activeSnapPoint`,
`onActiveSnapPointChange` and `fadeFromIndex` stop it at several heights, and the handle steps
through them with Enter or Space. A modal drawer scales the page behind it back like an iOS sheet
(`scaleBackground={false}` turns it off) while keeping fixed elements such as `FloatingButton` in
place, pushes the drawer under a newer modal back, and `modal={false}` leaves the page usable.
