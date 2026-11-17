---
'@gsainfoteam/ids-react': minor
---

Add `Scheduler`, a week (default) and day time grid for events. Each event is `{ id, title, start,
end, allDay?, colorScheme? }` with `@internationalized/date` values; overlapping events share the
column side by side, events past midnight are drawn on both days and all-day events sit in a row
under the weekday header. Previous, today and next are a ButtonGroup, the range button opens a
Calendar in a Popover, the view switch is a ToggleGroup, the grid is a ScrollArea whose weekday
header and time column stay in place, each day is a `<section>` named by its header and each event
an Item in an Item.Group with `<time dateTime>`. A Divider marks the current time, read from the
client clock after hydration or fixed with `now`. `view`, `date` and their defaults are
controllable, `locale` and `weekStartsOn` work as in Calendar, and the render-function child
returns `<Scheduler.Event>` for each event.
