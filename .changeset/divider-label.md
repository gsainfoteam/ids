---
'@gsainfoteam/ids-react': minor
---

Divider takes a label as `children`, drawn between two lines and linked as the separator's name,
with `align` (`start` / `center` / `end`) following the writing direction. A vertical divider
keeps one line of height outside a flex row. Lines use the neutral `--ids-color-border` and the
label `--ids-color-on-muted`. Adds `data-orientation`, `data-labelled`, `data-align`,
`Divider.State` and function `className` / `style`.

Breaking: the line color changes from the theme-tinted `--ids-color-outline` to the neutral
`--ids-color-border`, and Divider now accepts `children`.
