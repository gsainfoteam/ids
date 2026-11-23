---
'@gsainfoteam/ids-react': major
---

Progress's `shape="circular"` moved to a new `CircularProgress` component. It takes the same props (`value`, `max`, `indeterminate`, `getValueLabel`, `size`, `colorScheme`) and has its own parts (`CircularProgress.Label`, `.Value`, `.Track`, `.Indicator`), and both share one internal hook for the value, the label and the progressbar attributes. `Progress` always draws the bar: it loses `shape`, `Progress.Shape` and `Progress.State`'s `shape`, and its root no longer carries `data-shape`. A CircularProgress root carries `data-circular-progress`, and its Track and Indicator take `<circle>` attributes.

```tsx
<CircularProgress value={40}>
  <ArrowDownTrayIcon />
  <CircularProgress.Label>Downloading</CircularProgress.Label>
</CircularProgress>
```
