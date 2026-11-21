---
'@gsainfoteam/ids-react': patch
---

In a ButtonGroup or ToggleGroup with `attached={false}`, `Separator` is a short line centered
between the controls (20px, 16px at `tiny`) instead of a line as tall as them, so a spaced group
placed in an app's own bordered bar reads as a toolbar. Toggles in a spaced ToggleGroup keep their
own width when the group wraps; only an attached group shares its width between them.
