---
"ids_flutter": major
---

Text styles and fonts follow the CSS package.

- `IdsTypography` names match the CSS utilities (`text-body-b3-medium` is `bodyB3Medium`).
  `buttonStandard` and `buttonTiny` are gone; use `bodyB3Medium` and `captionC1Medium`.
- Fonts are fixed: Pretendard GOV for text and Geist Mono for `textStyle(..., mono: true)`.
  `fontFamily` and `monoFontFamily` are no longer theme settings. Both fonts ship in the package:
  Geist Mono (from Vercel's `geist` npm package) is new, and glyphs it lacks, such as Hangul, fall
  back to Pretendard GOV.
- `Label` uses the medium weight, like ids-react's Label.
- `scale` multiplies text size, `dimension` and radius.
