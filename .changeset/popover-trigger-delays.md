---
"@gsainfoteam/ids-react": major
---

Popover's `openDelay` and `closeDelay` moved from the root to `Popover.Trigger`, since only a hover trigger waits.

```tsx
<Popover triggerType="hover">
  <Popover.Trigger asChild openDelay={0} closeDelay={0}>
    <Button variant="outline">@gistory</Button>
  </Popover.Trigger>
  <Popover.Content>…</Popover.Content>
</Popover>
```
