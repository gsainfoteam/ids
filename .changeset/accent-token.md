---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
'ids_flutter': minor
---

Add the `accent` brand color (`--ids-color-accent`, `text-accent`, Flutter `IdsTheme.accent`) for
brand-colored text and icons on the page with no brand fill behind them. It reaches 4.5:1 on
`surface` and on `secondary` in both modes for all 17 colors: light is the lightest of steps
600, 700 and 800 that passes, dark the darkest of 500, 400 and 300.

Soft surfaces now use the `secondary` / `on-secondary` pair instead of a 10% tint of `primary`
with `primary` text: Button, IconButton and FloatingButton `soft`, a pressed `soft` Toggle and
IconToggle, Badge and Chip `soft`, the focused chip in ChipField and the `soft` OTPField slot.
Hover and press mix 6% and 12% of `primary` into `secondary`. Status schemes keep their tint and
`-strong` text. Outline Badge and Chip text, Rating stars and the Radio dot use `accent`.

Breaking: light `on-secondary` moves from step 700 to 800 for `amber`, `yellow`, `lime`,
`emerald`, `teal`, `cyan`, `sky`, `pink` and `rose`, so it keeps 4.5:1 on the soft hover and press
backgrounds. The internal `--control-accent` variable is replaced by `--control-soft`,
`--control-on-soft`, `--control-soft-hover` and `--control-soft-press`.
