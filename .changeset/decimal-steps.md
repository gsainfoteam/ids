---
'@gsainfoteam/ids-react': patch
---

NumberField and Slider do their step arithmetic with `decimal.js` instead of in-house decimal code. Values
and step marks are unchanged.
