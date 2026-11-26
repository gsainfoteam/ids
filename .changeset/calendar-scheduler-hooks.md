---
'@gsainfoteam/ids-react': major
---

Calendar and Scheduler take their options from new `useCalendar` and `useScheduler` hooks, and each root takes the result as one prop.

- Calendar loses `min`, `max`, `monthsToShow`, `today`, `month`, `defaultMonth` and `onMonthChange`, and takes `calendar`. `useCalendar({ availability, display, month })` holds `min`, `max` and `unavailable`, `monthsToShow` and `today`, and the visible month as `value` / `defaultValue` / `onValueChange`.
- Calendar's `disabled` is a boolean only and blocks the whole calendar. The date matcher it used to take is `availability.unavailable`.
- `value`, `defaultValue`, `onValueChange`, `selectionMode`, `readOnly`, `size` and `dir` stay on Calendar. The `CalendarOptions` type is gone.
- Scheduler loses `view`, `defaultView`, `onViewChange`, `dayCount`, `defaultDayCount`, `onDayCountChange`, `date`, `defaultDate`, `onDateChange`, `weekStartsOn`, `now`, `onEventChange` and `onSlotSelect`, and takes `scheduler`. `useScheduler({ views, navigation, editing })` holds the view and day count trios, the date trio with `weekStartsOn` and `now`, and `onEventChange` and `onSlotSelect`. `events` stays on Scheduler.
- Without the hook, `<Calendar />` and `<Scheduler events={events} />` render with the defaults.
- DateField and DateTimeField keep their API.

```tsx
const calendar = useCalendar({
  availability: { min, max, unavailable: { dayOfWeek: [0, 6] } },
  display: { monthsToShow: 2 },
});
<Calendar aria-label="달력" calendar={calendar} value={date} onValueChange={setDate} />;

const scheduler = useScheduler({
  views: { defaultValue: 'month' },
  editing: { onEventChange },
});
<Scheduler aria-label="일정표" events={events} scheduler={scheduler} />;
```
