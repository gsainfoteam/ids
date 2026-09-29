---
'@gsainfoteam/ids-react': minor
---

Add QRCode, which encodes `value` with `uqr` and draws it as one SVG in theme tokens (`on-surface`
modules on `surface`). It takes `size` (`standard` 128px, `tiny` 96px or a pixel number),
`errorCorrection` (`L` / `M` / `Q` / `H`, `M` by default and `H` with a logo), `shape` (`square` /
`rounded` / `dots`), `finderShape` (`square` / `rounded` / `circle`), `quietZone` (4 modules by
default) and `inverted`: left out it follows the theme and inverts in dark mode, `false` keeps dark
modules on a light plate in either mode for scanners that cannot read an inverted code, `true`
always inverts. `QRCode.Logo` clears the middle modules and places an image or icon there. The
code is `role="img"` named by `aria-label`, `aria-labelledby` or the `qrCode.label` message, never
by the value. Development warns on an empty value, a value too long to encode (drawn as an empty
plate with `data-overflow`) and a logo on level `L` or `M`.
