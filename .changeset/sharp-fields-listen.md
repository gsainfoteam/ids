---
'@gsainfoteam/ids-react': minor
---

Rework TextField as a container. `TextFieldGroup` is now `TextField`, the input moves to the `TextField.Input` sentinel, and `TextFieldGroup.Adornment` is gone — leading and trailing children are wrapped automatically.
