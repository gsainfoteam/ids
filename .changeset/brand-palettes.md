---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
'ids_flutter': minor
---

Add 17 brand colors: `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`,
`cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink` and `rose`, each with light
and dark themes. The palette is Tailwind CSS v4's default colors converted to hex; `orange` and
`green` keep IDS's own values. Every theme reaches 4.5:1 for `on-primary` on `primary` and
`on-secondary` on `secondary` in both modes: `on-secondary` is step 700 in light (800 for
`orange`) and 400 in dark, and `on-primary` is `neutral.950` for the light hues (`orange`, `amber`,
`yellow`, `lime`, `emerald`, `teal`, `cyan`, `sky`), where white text falls short.

Breaking: `blue`, `red`, `yellow` and `sky` move from Tailwind v3 to v4 values, which shifts `blue`
theme colors and the `danger`, `warning` and `info` status colors slightly. `orange` now draws
black text on `primary`, and `on-secondary` is one step darker in light mode and one step lighter
in dark mode for `blue`, `green` and `orange`.
