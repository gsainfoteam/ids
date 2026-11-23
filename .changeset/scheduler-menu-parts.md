---
"@gsainfoteam/ids-react": major
---

Scheduler's right-click menus are parts, not render props.

- `eventMenu={(event) => …}` is `<Scheduler.EventMenu>{(event) => …}</Scheduler.EventMenu>`.
- `slotMenu={(slot) => …}` is `<Scheduler.SlotMenu>{(slot) => …}</Scheduler.SlotMenu>`.
- Both go among `Scheduler`'s children, beside the function that draws each event.
