---
'@gsainfoteam/ids-react': minor
---

Label works with any control: a role widget such as `role="slider"`, which the browser does not
label, gets the label as its name through `aria-labelledby` and takes focus on click, and a
checkbox-like widget toggles as it would under a native label. The label mirrors its control's
`disabled` / `required` (including `aria-*` and later changes), shows a required asterisk, and
takes `required`, `disabled` and `size` props to override. Adds `data-disabled`,
`data-required`, `Label.State` and function `className` / `style`, and warns in development
inside a Field or when linked to nothing.

Breaking: Label is now `inline-flex` with `text-body-b3-medium` (was `inline-block`,
`text-body-b2-medium`), always renders an `id`, and prevents text selection.
