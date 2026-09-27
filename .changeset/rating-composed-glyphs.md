---
'@gsainfoteam/ids-react': minor
---

Rating takes its glyph from `Rating.Item` composition: an item without `index` draws every
position and an indexed item draws its own, with state-function `className`, `style` and
`children` (`index`, `itemValue`, `fill`). It now joins forms through the shared form value: a
hidden input only with a `name` and a score, and `required` that blocks a submit at 0 with
"점수를 선택하세요." (`requiredMessage`). The `id` and `ref` stay on the group, whose `focus()`
moves to the checked option, so a Field label and react-hook-form's error focus no longer chase
the selection. Half steps fill and split from the inline start under `dir="rtl"`, the root
exposes `Rating.State` to `className` and `style` along with `data-previewing`,
`data-readonly`, `data-required` and `data-invalid`, focus uses the shared `focus-ring`, and
labels come from the shared messages.

Breaking: `onChange(value)` is now `onValueChange(value)`. `variant` is removed: draw hearts,
circles or any icon with `Rating.Item`, and `Rating.Item` no longer takes `asChild` nor requires
one item per index. An unrated (0) value is no longer submitted as `0`. The fill color variable
`--ids-rating-color` is renamed `--rating-accent`, and empty glyphs use the neutral border color.
