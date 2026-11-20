---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
'ids_flutter': minor
---

Add SegmentedControl, a single choice drawn as segments on a track. Each `SegmentedControl.Item`
is a `<label>` around a visually hidden native radio, so arrows, Home and End, `name`, `required`,
`form`, form reset, `readOnly`, `disabled` and react-hook-form work the way RadioGroup's do. The track is
`bg-neutral-subtle` at `concentric-p-1` and as tall as a control, and the selected segment is a card
in the new `bg-segmented-control-item` component token (`bg-neutral-subtlest` in light, `bg-neutral` in dark) with
`shadow-xs`.
