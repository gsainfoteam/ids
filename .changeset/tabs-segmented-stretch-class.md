---
"@gsainfoteam/ids-react": major
---

`Tabs.List` and SegmentedControl drop `stretch`. Share the width with `*:flex-1` on the list, and widen a content-wide track (SegmentedControl, segmented Tabs) with `w-full`. `Tabs.List` no longer carries `data-stretch`.

```tsx
<Tabs.List className="*:flex-1">…</Tabs.List>
<SegmentedControl className="w-full *:flex-1">…</SegmentedControl>
```
