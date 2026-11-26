---
'@gsainfoteam/ids-react': major
---

ChipField, Slider, Questionnaire and OTPField follow the props rule.

Breaking:

- ChipField: `onCreate`, `validate` and `maxCount` move into `useChipField({ create: { onCreate, validate }, maxCount })`,
  passed as `chipField`. `ChipField.Group`'s `heading` is the `ChipField.GroupLabel` part, and
  `ChipField.Content`'s `mobileVariant` is `narrow` (`'drawer'` by default).
- Slider: `largeStep`, `minStepsBetweenThumbs` and `formatLabel` move into `useSlider()`, passed as
  `slider`. `min`, `max`, `step`, `orientation`, the value trio and `onValueCommit` stay on the root.
- Questionnaire: `advanceOnSelect` is `advance="select"` (`'submit'` by default). A question's
  `optional` is `required`, and a question without `required` is now optional. An option's
  `description` is the `Questionnaire.OptionDescription` part. The root takes `value` and
  `onValueChange` beside `defaultValue`.
- OTPField: `mask` is `'none' | 'dot'`. A custom character is drawn in `OTPField.Slot`'s children
  with `OTPField.Caret`.
- All four drop `invalid`: they read `aria-invalid`, or the `invalid` of the surrounding `Field`.
