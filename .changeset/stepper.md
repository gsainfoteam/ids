---
"@gsainfoteam/ids-react": minor
---

Add `Stepper`, the progress of a task in ordered steps. The current step is `value` (`defaultValue`,
`onValueChange`), the steps before it are completed and the ones after it upcoming; a step can be
marked `completed`, `error` or `disabled`. `linear` (the default) lets a user press only the steps
behind and the next one, `linear={false}` any step, and a `value` without `onValueChange` only shows
progress. Steps are an `ol` with `aria-current="step"`, one Tab stop with arrow keys, `Home` and
`End` between them, and read "completed" and "error" after their title. Parts: `Stepper.Item`,
`Trigger`, `Indicator` (number, check or error icon), `Title`, `Description`, `Separator` and
`Content` panels; `horizontal` or `vertical`, `standard` or `tiny`.
