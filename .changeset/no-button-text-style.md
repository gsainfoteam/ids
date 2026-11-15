---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': patch
---

`text-button-standard` and `text-button-tiny` are gone from the CSS. Controls use the body and
caption styles instead: `text-body-b3-medium` and `text-caption-c1-medium`. Button, ButtonGroup,
FloatingButton and every control drawn by `control-surface` keep their height and label position,
since they center a single line in a fixed height.
