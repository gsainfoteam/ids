---
'@gsainfoteam/ids-react': minor
---

Add ColorPicker, the panel ColorField opens, as a component of its own. The saturation and
brightness area reads as two sliders with a 2D role description and moves on both axes by arrow
keys, Shift for 10% steps, PageUp and PageDown, Home and End; a press on the area jumps there and a
drag keeps the pointer captured. Hue and alpha are the IDS Slider on a gradient track, so they
share its keys, pointer handling and value text. Dragging through black or a gray keeps the hue and
saturation the user was on.

The text input, a monospace TextField, reads hex (with or without `#`), `rgb()` and `hsl()`, stays
a draft until Enter or blur, reverts unreadable text, and lets the first Escape drop a draft without
closing a surrounding popup. `ColorPicker.EyeDropper` appears only where `window.EyeDropper` exists and
`ColorPicker.Copy` announces the copy; both are outline IconButtons whose child replaces the icon.
`ColorPicker.Swatches` is a RadioGroup of square Radios: native radios with one Tab stop, arrow
keys, Home and End, kept out of any form around the picker. Parts (`Area`, `HueSlider`,
`AlphaSlider`, `Input`, `EyeDropper`, `Copy`, `Swatches`, `Swatch`) compose a smaller picker.
