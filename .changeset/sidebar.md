---
'@gsainfoteam/ids-react': minor
---

Add `Sidebar`, the app's main menu: `Sidebar.Header`, `Group`, `Item`, `Footer` and `Trigger`, with the optional `Sidebar.Provider` and `Sidebar.Inset` for a trigger and page outside it. Items mark the current page with `aria-current="page"`, an item inside an item is a submenu (an Accordion, or a Menu in the icon rail), and `variant` picks `sidebar`, `floating` or `inset`. `collapsible` folds it to an icon rail with tooltips or takes it off the canvas, `Mod+B` toggles it, and `persist` writes the state to a cookie that the server can pass back as `defaultCollapsed`. Below 640px the sidebar opens in a Drawer that closes when an item is pressed.
