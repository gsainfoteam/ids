---
'@gsainfoteam/ids-react': major
---

Split `Timeline` out of `Stepper`, move the Sidebar options into `useSidebar` and drop one-flag props.

- `Stepper progress={false}` is now `Timeline` (`Data/Timeline`), vertical by default, with the same parts and look. `Stepper` loses `progress`.
- `Stepper.Item completed` / `error` become `status="completed" | "upcoming" | "error"`; `Timeline.Item` takes `status="completed" | "error"` (none is `neutral`).
- `Sidebar`'s `collapsible`, `collapsed`, `defaultCollapsed`, `onCollapsedChange`, `shortcut` and `persist` move into `useSidebar({ collapse: { mode, collapsed, defaultCollapsed, onCollapsedChange, persist }, shortcut })`, passed as `sidebar={...}`.
- `Sidebar.Group`'s `label` is the `Sidebar.Group.Label` part, `collapsible` and `defaultOpen` become `collapse={{ open, defaultOpen, onOpenChange }}`, and `items` with its render function moves to `Sidebar.Group.Tree`, whose `onItemsChange` and `canMove` go into `sortable={{ ... }}`.
- `Progress` and `CircularProgress` drop `indeterminate`: leave `value` out or pass `null`.
- `Skeleton` drops `loading`: `aria-busy={false}` shows the content.
- `Marker` drops `pending`: `aria-busy` draws the spinner and the shimmer.
- `ScrollArea`'s `fade` is `'y' | 'x' | 'both'`; a bare `fade` is `fade="both"`.
