---
'@gsainfoteam/ids-react': minor
---

Add toasts: `toast(message, options)` with `toast.info`, `.success`, `.warning`, `.error`,
`.loading`, `.promise`, `.dismiss` and `.dismissAll`, callable from anywhere, and `Toaster` to
place them (`placement`, `max`, `gap`, `offset`, `expand`, `hotkey`). The outermost `IdsProvider`
renders a default toaster, which an app's own `Toaster` replaces. Toasts share Alert's color
schemes, icons and politeness (warnings and errors interrupt), take a description, an action
button and a duration (`Infinity` to stay), and update in place when shown again with the same
`id`, which `toast.promise` uses to go from loading to its result. They stack with the newest in
front, expand on hover or focus, pause while hovered, focused or in a hidden tab, dismiss with a
swipe toward the edge, and stay above and clickable over an open Dialog. F6 or Alt+T moves focus
into the toasts and back.
