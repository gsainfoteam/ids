---
'@gsainfoteam/ids-react': minor
---

Add SegmentedControl, a single choice drawn as segments on a track. Each `SegmentedControl.Item`
is a `<label>` around a visually hidden native radio, so arrows, Home and End, `name`, `required`,
`form`, form reset, `readOnly`, `disabled` and react-hook-form work the way RadioGroup's do. It
shares the segmented Tabs surface (`internal/surfaces/segment-surface.ts`): a `bg-neutral-subtle`
track as tall as a control with the selected segment as a `bg-segment` card.
