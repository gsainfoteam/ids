---
'ids_flutter': patch
---

The internal `IdsGroup` that ButtonGroup and ToggleGroup will share follows ids-react: it takes a
`size` that nested groups inherit, and with `attached: false` its separator is a short line
centered between the controls, 20px tall (16px at `tiny`), instead of crossing the whole group.
