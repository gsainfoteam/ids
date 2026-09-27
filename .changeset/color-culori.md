---
'@gsainfoteam/ids-react': minor
---

ColorPicker and ColorField read and write colors with culori. They now read named colors,
`oklch()` and `color(srgb ...)`, clip a color outside sRGB to the nearest one the picker can
show, and take `format="oklch"`.

Breaking: `hsl` values keep two decimals (`hsl(217.22, 91.22%, 59.8%)` rather than
`hsl(217, 91%, 60%)`), and alpha in `rgb`, `hsl` and `oklch` values is rounded to two decimals
instead of three.
