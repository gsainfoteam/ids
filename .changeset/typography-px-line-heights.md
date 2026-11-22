---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
'ids_flutter': minor
---

The type scale sets line heights in whole pixels, on a 4px grid above c2, instead of ratios that landed on
16.2px or 24.3px: c2 14, c1 16, b3 20, b2 24, b1 28, h6 28, h5 32, h4 36, h3 40, h2 48, h1 56. They
follow `--ids-scale` like the font sizes, and the `leading-*` primitives take the size names
(`leading-b3`). Letter spacing follows the size: 0 up to 24px, `tracking-snug` (-0.015em) at 28 and
32px, `tracking-tight` (-0.025em) at 40 and 48px.

Breaking: the `subtitle-s1-*` and `subtitle-s2-*` styles are gone, since they matched
`body-b1-*` and `body-b2-*` in size; use `text-body-b1-semibold` and `text-body-b2-semibold`
(Flutter `IdsTypography.bodyB1Semibold`, `bodyB2Semibold`). The `tight`, `snug` and `body-b*`
line-height primitives are replaced by the size-named ones.

`leading-prose` (28px) is new for long text. Editor's body is `text-body-b2-regular
leading-prose` (a tiny Editor `text-body-b3-regular`), and its headings are semibold and one step
smaller: h1 24px, h2 20px, h3 18px, h4 16px.

`@gsainfoteam/ids-css` adds `document-text`, a utility that sets tag-only long text (Markdown,
Editor) in the IDS type scale: blocks stacked with an 8px gap, headings 16px further from the
block above, lists, quotes, code, links and rules. Editor's document is drawn with it.
