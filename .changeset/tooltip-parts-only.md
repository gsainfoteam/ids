---
"@gsainfoteam/ids-react": major
---

Tooltip drops its `content` and `arrow` shorthand and moves `side`, `align` and `sideOffset` to `Tooltip.Content`. Write `Tooltip.Trigger` and `Tooltip.Content`, and add `Tooltip.Arrow` inside the content for a tail. The root keeps the open trio, `openDelay`, `closeDelay` and `disabled`.

```tsx
<Tooltip>
  <Tooltip.Trigger asChild>
    <Button>저장</Button>
  </Tooltip.Trigger>
  <Tooltip.Content side="bottom">
    변경 사항 저장
    <Tooltip.Arrow />
  </Tooltip.Content>
</Tooltip>
```
