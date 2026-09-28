---
'@gsainfoteam/ids-react': patch
---

NumberField and Slider do their step arithmetic with `bignumber.js` instead of in-house decimal code. Values
and step marks are unchanged.
