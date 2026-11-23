---
'@gsainfoteam/ids-react': major
---

Avatar is always a circle. `shape` is gone from `Avatar` and `AvatarGroup`, together with the `Avatar.Shape` and `AvatarShape` types, `shape` in `Avatar.State` and `AvatarGroup.State`, and the root's `data-shape` attribute. Drop `shape="circle"`; a square logo or product picture is drawn with another element, such as `Item.Media`. Badge still pulls itself onto the edge of any Avatar it wraps.

```tsx
<Avatar name="Alice Kim" />
```
