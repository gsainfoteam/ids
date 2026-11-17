---
'@gsainfoteam/ids-react': minor
---

ButtonGroup and ToggleGroup replace `attached` with `layout`: `attached` (the default, as before),
`spaced` (what `attached={false}` was) and `tray`. A tray floats its controls 4px apart inside a
bordered bar, the way an image viewer's toolbar does; its `Separator` is a short line centered
between the controls, and the controls are drawn without a fill (`ghost`) unless they or the group
set a `variant`.

Breaking: `attached={false}` is now `layout="spaced"`, and `attached` is gone.
