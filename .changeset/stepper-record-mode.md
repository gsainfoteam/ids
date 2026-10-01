---
"@gsainfoteam/ids-react": minor
---

`Stepper` takes over the uses planned for Timeline. `progress={false}` lists events with no current
step: an unmarked event gets the new `neutral` status (`data-state="neutral"`, `data-neutral`),
drawn as a 10px dot on the first line of its title with no status text, while `completed` and
`error` still draw and read as before. A record is always display-only and has no default list
name; `value`, `defaultValue`, `onValueChange` and `linear` are ignored and a missing `aria-label`
or `aria-labelledby` warns in development. Its connector lines stay neutral and run from one
indicator to the next. `Stepper.State` gains `progress`, and its `value` is `-1` in a record.
