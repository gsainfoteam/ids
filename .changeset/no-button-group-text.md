---
'@gsainfoteam/ids-react': minor
---

`ButtonGroup.Text` and `Group.Text` are removed. Text in front of a field belongs to the field: put it
inside `TextField` (`<TextField><span>https://</span></TextField>`), which keeps it in the field's
border and focus ring and focuses the input when it is pressed. A TextField still joins a ButtonGroup
like an outline control.
