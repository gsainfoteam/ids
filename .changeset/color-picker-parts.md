---
'@gsainfoteam/ids-react': major
---

ColorPicker drops its `alpha` and `swatches` props. The alpha channel is on when a `ColorPicker.AlphaSlider` is among the picker's children (found statically, also when a Server Component hands the part over), and the palette is a `ColorPicker.Swatches` part holding one `ColorPicker.Swatch` per color. A ColorPicker with no children draws the area, the eyedropper, the hue slider, the input and the copy button, with no alpha slider and no palette. A `Swatches` with no `Swatch` draws nothing, and an `AlphaSlider` the root cannot see (inside a component of your own) draws nothing and warns in development. `ColorField`'s own `alpha` and `swatches` are unchanged.

```tsx
<ColorPicker defaultValue="#3B82F6CC">
  <ColorPicker.Area />
  <ColorPicker.HueSlider />
  <ColorPicker.AlphaSlider />
  <ColorPicker.Input />
  <ColorPicker.Swatches>
    <ColorPicker.Swatch value="#EF4444" label="빨강" />
    <ColorPicker.Swatch value="#3B82F6" />
  </ColorPicker.Swatches>
</ColorPicker>
```
