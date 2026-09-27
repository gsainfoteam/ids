---
'@gsainfoteam/ids-react': minor
---

CheckboxGroup gains `required` meaning "at least one", enforced by the form with its own message
(`requiredMessage`, default "하나 이상 선택하세요."), plus `readOnly`, `invalid`, `name`, `form`,
`variant`, reset to `defaultValue`, and a stable root for `ref` and `id` whose `focus()` lands on
the first checked box, which is where react-hook-form's error focus now goes. A Checkbox with a
`value` joins the group it is rendered in, so the group takes plain children and
`CheckboxGroup.All` as well as its typed render function. The select-all box lists the boxes it
controls in `aria-controls`, and `className` and `style` accept a function of
`CheckboxGroup.State`. `controlMode="value"` connects the array value.

Breaking: `onChange(value)` is now `onValueChange(value)`. The layout `variant` (`vertical` /
`horizontal` / `grid`) is now `orientation` (`vertical` / `horizontal`); `variant` is the items'
`outline` / `soft`, and a grid comes from `className` (for example `grid grid-cols-2`), so
`columns` is removed. A Checkbox inside a CheckboxGroup throws with `checked` or
`defaultChecked`.
