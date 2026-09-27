---
'@gsainfoteam/ids-react': minor
---

Restyle TimePicker after shadcn/ui (borderless columns with a soft focus ring, a muted active
option, a solid primary selection) and move its logic into `useTimePicker`. Every column is
padded by half its height so the picked time reads across one middle row, its height is set by
`--time-picker-height` (five options by default), and a 12-hour hour column runs 12, 1, ... 11. New: typing digits jumps to an option,
`Delete` / `Backspace` clears the value to `null`, left and right arrows follow the text
direction, `referenceDate` sets the day an empty picker builds on, `TimePicker.State` and
`TimePicker.OptionState`, function `className` / `style` on the root, `data-selected`,
`data-active` and `data-disabled` on options, a default `TimePicker.Header` that names the
columns, and `asChild` on `Column` and `Period`.

Breaking: `onChange(value: Date)` is now `onValueChange(value: Date | null)` and no longer fires
when the selected time is picked again. The default `locale` is `ko-KR` (from the shared
messages), so the default hour cycle is 12 hours with a period column. An empty picker builds
the time on today instead of 2000-01-01. The group and column names are Korean (`시간`, `시`,
`분`, `초`, `오전/오후`). A `Column` function child now renders each option's label instead of
replacing the whole option list.
