---
'@gsainfoteam/ids-react': major
---

CheckboxGroup loses `requiredMessage`. The message a required group shows when nothing is checked comes from the `checkboxGroup.required` string, so an app changes it through `IdsProvider translate` like every other IDS string.
