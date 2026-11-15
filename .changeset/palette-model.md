---
'@gsainfoteam/ids-react': minor
---

A palette built from one color (`createIdsPalette`, or a CSS color given as `primary`,
`secondary`, `tertiary` or a status) now comes from a continuous model instead of blending the two
nearest of 17 reference palettes. ids-react no longer ships those palettes, only the model's
coefficients and the four status palettes (green, yellow, red, sky).

- The model is a Fourier series of the 500 hue per step, for lightness, chroma as a share of the
  sRGB maximum, and hue rotation. It was fitted to the 17 palettes, within ΔE_OK 0.011 on average
  and 0.063 at worst (green), and its coefficients are now fixed in core.
- The color given now appears in the palette unchanged, at the step whose lightness is nearest
  (`'#0d9488'` is step 600).
- Every generated color shifts slightly. Derived secondary and tertiary palettes follow the same
  model.
