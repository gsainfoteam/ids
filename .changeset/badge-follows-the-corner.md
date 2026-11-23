---
'@gsainfoteam/ids-react': major
---

Badge only marks the corner of something, and it puts its center on that corner's curve.

- `children` is required and is exactly one element; Badge checks it with `Children.only`, so text, several elements or `false` throw. A badge on its own, inside running text or a list row, is a `Chip` now: `<Badge content="Beta" variant="soft" />` becomes `<Chip>Beta</Chip>`, and `<Badge content={12} />` becomes `<Chip variant="solid">12</Chip>`.
- `dot` is gone. A Badge without `content` is a dot, and a Chip without children is a dot (`role="img"` when it has an `aria-label`).
- `shape` is gone, together with the `Badge.Shape` and `BadgeShape` types. Badge measures the corner radius and `corner-shape` of the element it wraps, the way CSS draws them, and sits on the curve of an Avatar, a button, a Card, a `rounded-full` pill, an elliptical or a squircle corner with nothing to set. Drop `shape="circular"` and `shape="rectangular"`.
- The default `colorScheme` is always `danger`.

The server HTML and the first paint before hydration draw the badge at the corner point; it moves onto the curve once the client has measured the corner.

```tsx
<Badge content={3}>
  <IconButton aria-label="알림" icon={<BellIcon />} />
</Badge>
<Chip variant="solid" colorScheme="primary" aria-label="읽지 않음" />
```
