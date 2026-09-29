---
'@gsainfoteam/ids-react': patch
---

A NumberField stepper still steps and repeats when the browser cannot capture the pointer that
pressed it, as with the synthetic pointer events of testing libraries in Firefox.
