---
"@gsainfoteam/ids-react": minor
---

Add `Scheduler`, a month calendar and a week (default), N-day (`dayCount` from 2 to 14, 3 by default, typed into a NumberField in the toolbar) and day time grid for events. Each event is `{ id, title, start,
end, allDay?, colorScheme? }` with `@internationalized/date` values; overlapping events share the
column side by side, events past midnight are drawn on both days and all-day events sit in a row
under the weekday header. An all-day `end` is the day after the last day, as in iCal and Google
Calendar. Previous, today and next are a ButtonGroup, the range button opens a
Calendar in a Popover, the view switch is a ToggleGroup, the grid is a ScrollArea whose weekday
header and time column stay in place, each day is a `<section>` named by its header and each event
an Item in an ItemGroup with `<time dateTime>`. A Divider marks the current time, read from the
client clock after hydration or fixed with `now`. `view`, `date` and their defaults are
controllable, `locale` and `weekStartsOn` work as in Calendar, and the render-function child
returns `<Scheduler.Event>` for each event. With
`onEventChange(event, { start, end })` a timed event moves by dragging (or Space, the arrow keys and
Enter) in 15-minute and one-day steps, and its bottom edge, a vertical Resizable, changes the end. `eventMenu(event)` and
`slotMenu({ start, end, allDay })` return the Menu items a right-click on an event or on an empty half hour
opens. In month view, all-day and multi-day events are filled bars that wrap onto the next week with
flat ends, one-day timed events an unfilled line with a colored dot and their start time, and a day with more than three rows folds the rest into a
`+N` button that opens that day; a right-click on an empty day hands `slotMenu` the whole day. With
`onEventChange`, month events also move to another day by dragging (or Space, the arrow keys by a
day or a week, and Enter), keeping their time. `onSlotSelect({ start, end, allDay })` reports a
range dragged over empty space (with the mouse, or a touch held for 250 ms): quarter hours within a day in the time grid, whole
days in month view.
