---
'@gsainfoteam/ids-react': major
---

Badge measures the corner of the element it wraps and puts its center on that curve, so it sits on the edge of an Avatar, a button, a Card, a `rounded-full` element or a squircle corner with nothing to set. `shape` is gone from `Badge`, together with the `Badge.Shape` and `BadgeShape` types. Drop `shape="circular"` and `shape="rectangular"`.

The server HTML and the first paint before hydration draw the badge at the corner point; it moves onto the curve once the client has measured the corner.

```tsx
<Badge content={3}>
  <IconButton aria-label="알림" icon={<BellIcon />} />
</Badge>
```
