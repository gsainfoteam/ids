---
'@gsainfoteam/ids-react': minor
---

Add `Navbar`, the bar at the top of an app: a `<header>` whose children before `Navbar.Nav` sit at the start (a logo) and those after it at the end (Button, Avatar, Menu). `Navbar.Nav` is a labelled `<nav>` with a `<ul>` of `Navbar.Item` links, drawn as `Link`s without an underline; the item whose `value` matches the Navbar's `value` is the current page and gets `aria-current="page"`. `Navbar.Item asChild` takes a router link. Below 640px the nav hides and a menu button opens it in a left Drawer that closes when an item is pressed; `Navbar.MenuTrigger` places that button where the app wants it, and without one it comes first in the bar. `sticky` pins the bar to the top and `bordered` (on by default) draws a Divider under it. `Link` gains `underline="none"`.
