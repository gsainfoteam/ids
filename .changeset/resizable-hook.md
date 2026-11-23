---
"@gsainfoteam/ids-react": major
---

Resizable takes its size, bounds and step from a `useResizable()` hook instead of root props. `width`, `defaultWidth`, `onWidthChange`, `height`, `defaultHeight`, `onHeightChange`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `step` and `getValueLabel` are gone from `<Resizable>`; each axis is an object `{ value, defaultValue, onValueChange, min, max }` in the hook, and the root takes the result as `resizable`. Without the hook the element starts at its CSS size with no bounds. Resizable never reads `className` or `style` to decide its size or bounds.

```tsx
const resizable = useResizable({
  width: { defaultValue: 400, min: 240, max: 640 },
  height: { value: height, onValueChange: setHeight },
  step: 12,
});

<Resizable resizable={resizable} />
<Resizable className="h-60 w-100" />
```
