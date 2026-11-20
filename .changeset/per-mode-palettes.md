---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
'ids_flutter': minor
---

Split every palette into a light and a dark scale of eight steps, numbered by use (1 page, 2 band,
3 soft, 4 line, 5 handle, 6 accent text, 7 fill, 8 strong text), so each mode picks its own
values. Roles read the same step in both modes.

- Neutral follows shadcn/ui's neutral theme: light `#ffffff` `#fafafa` `#f5f5f5` `#e5e5e5`
  `#d4d4d4` `#525252` `#171717` `#0a0a0a`, dark `#0a0a0a` `#171717` `#1e1e1e` `#232323` `#2f2f2f`
  `#d4d4d4` `#fafafa` `#fafafa`. Dark `border-neutral` is `#232323`, and body text is `#0a0a0a` in
  light.
- A brand or status color given as one color or as a 50 to 950 ramp becomes two scales. Dark
  surfaces sit on the ramp at the lightness of the dark neutral step with the same number, so a
  dark `bg-primary-subtle` is as light as `bg-neutral-subtle` and only its hue differs.
- `primary`, `secondary`, `tertiary` and status colors also take `{ light, dark }` scales of eight
  colors each (`IdsPalette(light:, dark:)` in Flutter).
- Light `text-on-X-subtler` is now the same step as `text-on-X-subtle`.

Breaking:

- `createIdsPalette(color)` returns `{ light, dark }` scales. The old 50 to 950 result is
  `createIdsRamp(color)`, and its types are `IdsRamp` and `IdsRampStep` (was `IdsPalette` and
  `IdsPaletteStep`). `IdsScale` and `IdsScaleStep` are new.
- Flutter: the 50 to 950 class `IdsPalette` is renamed `IdsRamp`; `IdsPalette` now holds the two
  scales. `IdsColorRoles.neutralSteps` maps a role to a scale step for both modes, and
  `IdsColorRoles.neutralScales` holds the neutral values.
- `packages/core/tokens/semantic/neutral.{light,dark}.json` is replaced by
  `packages/core/neutral-roles.json`.
