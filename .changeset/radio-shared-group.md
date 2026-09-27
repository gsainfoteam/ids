---
'@gsainfoteam/ids-react': minor
---

Redraw Radio as a shadcn-style circle over its real input, with a neutral border and a
theme-colored dot, and add `Radio.Indicator` with `asChild`. A Radio now joins the RadioGroup it is
rendered in, so the group takes plain `Radio` children as well as its typed render-function
`Item`. State is exposed as `data-state` and the other `data-*` flags, with `Radio.State` and
state-function `className`, `style` and `children`. An uncontrolled Radio follows its native
group, so choosing a groupmate updates its `data-state` and reports `onCheckedChange(false)`.

RadioGroup gains `readOnly`, `required` (native), `invalid`, `form`, `variant`, reset to
`defaultValue`, and a stable root for `ref` and `id` whose `focus()` lands on the checked radio,
which is where react-hook-form's error focus now goes. `controlMode="value"` connects it.

Breaking: RadioGroup's `onChange(value)` is now `onValueChange(value)`, and its `variant`
(`vertical` / `horizontal`) is now `orientation`; `variant` is the items' `outline` / `soft`.
Radio's `onChange(checked, event)` is now `onCheckedChange(checked)` with `onChange` the native
event, `className` and `style` go to the drawn circle, `value` is a string, and a Radio inside a
RadioGroup throws without a `value` or with `checked` / `defaultChecked`. Items are 16px
(`standard`) and 14px (`tiny`), down from 20px and 16px.
