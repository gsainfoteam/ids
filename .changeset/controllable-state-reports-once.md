---
'@gsainfoteam/ids-react': patch
---

`useControllableState` reports a value once even when it is set twice before the next render, and
an updater sees the value set just before it. NumberField no longer reports the same number twice
when Firefox delivers typed text through composition and then through `input`.
