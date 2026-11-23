---
"@gsainfoteam/ids-react": major
---

Drawer takes its snap points from a new `useDrawer` hook and draws a close button only when one is written.

- `snapPoints`, `activeSnapPoint`, `defaultActiveSnapPoint`, `onActiveSnapPointChange` and `fadeFromIndex` moved into `useDrawer({ snap: { points, value, defaultValue, onValueChange, fadeFrom } })`, whose result goes to the new `drawer` prop. `drawer.snap.value` and `drawer.snap.setValue` reach the height from outside the Drawer.
- `hideClose` is gone. The corner X is drawn only where `<Drawer.Close />` with no children is written; put it last in `Drawer.Content`.
- `scaleBackground` is gone. A modal Drawer always scales the page behind it; `modal={false}` leaves the page alone.

```tsx
const drawer = useDrawer({ snap: { points: [0.3, "420px", 1] } });

<Drawer side="bottom" drawer={drawer}>
  <Drawer.Content>
    <Drawer.Title>경로</Drawer.Title>
    <Drawer.Close />
  </Drawer.Content>
</Drawer>;
```
