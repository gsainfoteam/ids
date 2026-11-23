---
'@gsainfoteam/ids-react': major
---

ColorField drops `alpha`, `swatches` and `mobileVariant`. `ColorField.Content` holds them as parts:

- The value carries alpha when a `ColorPicker.AlphaSlider` sits in `ColorField.Content`.
- Swatches are `ColorPicker.Swatches` with `ColorPicker.Swatch` children in `ColorField.Content`.
- `mobileVariant` moved to `ColorField.Content` (`popover` stays the default).

```tsx
<ColorField format="hsl">
  <ColorField.Content mobileVariant="drawer">
    <ColorPicker.Area />
    <ColorPicker.HueSlider />
    <ColorPicker.AlphaSlider />
    <ColorPicker.Input />
    <ColorPicker.Swatches>
      <ColorPicker.Swatch value="#EF4444" />
    </ColorPicker.Swatches>
  </ColorField.Content>
</ColorField>
```
