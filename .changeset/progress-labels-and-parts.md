---
'@gsainfoteam/ids-react': minor
---

Progress names its progressbar from `Progress.Label` and reports `aria-valuetext`, formatted by
the new `getValueLabel(value, max)`, which also becomes the default `Progress.Value` text. Values
outside `0..max` are clamped with a development warning, NaN or a non-positive `max` render as
indeterminate, and the percentage rounds down so 100% only appears when done. Adds optional
`Progress.Track` and `Progress.Indicator` parts (children before the Track sit above the bar,
after it below), `asChild` on Label, Value and Indicator, function `className` / `style` and
`Progress.Value` children that read `Progress.State`, the `info` color scheme, `data-complete`
and `data-indeterminate`, a bar that slides with `translate` and fills from the right in RTL.

Breaking: an out-of-range `value` or a non-positive `max` no longer throws. `Progress.Value` is
`aria-hidden`, and the default percentage rounds down instead of to the nearest integer. The
`neutral` scheme fills with `on-surface` instead of `on-muted`. `PartProps` is replaced by
`Progress.Label.Props`, `Progress.Value.Props`, `Progress.Track.Props` and
`Progress.Indicator.Props`.
