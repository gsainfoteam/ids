---
"@gsainfoteam/ids-react": major
---

Slider loses `selectionMode`, `marks`, `valueLabel` and `thumbLabels`:

- A value of `[start, end]` makes a range slider and a number a single one. The first `value ?? defaultValue` fixes the shape; a later change of shape warns in development and is fitted to the first one. With no value the slider is single.
- Marks are parts: `<Slider.Marks />` draws a tick at every step, and `<Slider.Mark value={50} />` inside it draws a tick with `formatLabel(50)` or its children as the label. A Slider without a `Slider.Track` among its children draws the default track before them.
- The value label is the `Slider.ValueLabel` part, which the default thumb draws while the thumb has keyboard focus or is dragged. `<Slider.Thumb>{null}</Slider.Thumb>` leaves it out. `valueLabel="always"` has no replacement yet.
- A range thumb's name is `Slider.Thumb`'s own `aria-label` (default "시작" and "끝").
- `SliderProps` takes the value type, `SliderProps<number>` or `SliderProps<[number, number]>`, and `SliderValueLabel` is gone.

```tsx
<Slider
  defaultValue={[20, 80]}
  formatLabel={(value) => `${value}%`}
  aria-label="가격"
>
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb index={0} aria-label="최저가" />
    <Slider.Thumb index={1} aria-label="최고가" />
  </Slider.Track>
  <Slider.Marks>
    <Slider.Mark value={0} />
    <Slider.Mark value={100} />
  </Slider.Marks>
</Slider>
```
