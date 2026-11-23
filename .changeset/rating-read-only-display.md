---
'@gsainfoteam/ids-react': major
---

Rating loses `selectionMode` and `requiredMessage`. `readOnly` now does what `selectionMode="none"` did: the score is drawn as one `role="img"` read as "평균 평점: 5점 만점에 4.5점", with no radios and no Tab stop, and with a `name` it still submits the score through a hidden input. A read-only Rating no longer carries `aria-readonly`. The message a required Rating shows at 0 comes from the `rating.required` string through `IdsProvider translate`.

```tsx
<Rating readOnly value={4.5} step={0.5} aria-label="평균 평점" />
```
