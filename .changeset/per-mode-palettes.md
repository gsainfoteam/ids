---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
'ids_flutter': minor
---

Every palette is now a light and a dark scale of nine steps, numbered outward from the page: 1
base, 2 surface, 3 block, 4 soft, 5 border, 6 strong border, 7 solid, 8 text, 9 strong text. Roles
read the same step in both modes.

- Neutral follows shadcn/ui's neutral theme: light `#ffffff` `#ffffff` `#fafafa` `#f5f5f5`
  `#e5e5e5` `#d4d4d4` `#a3a3a3` `#525252` `#0a0a0a`, dark `#0a0a0a` `#171717` `#1e1e1e` `#262626`
  `#2e2e2e` `#3a3a3a` `#737373` `#d4d4d4` `#fafafa`. Neutral 7 has no role; `bg-neutral-solid`
  reads 9.
- Backgrounds are named by use (`bg-base`, `bg-surface`, `bg-block`, `bg-X-soft`, `bg-X-solid`),
  lines and text by strength (`border-X`, `border-X-strong`, `text-X`, `text-X-strong`).
  `bg-block` marks off a region on base or surface (Card and Dialog footer, Table header and
  stripes, CodeBlock, soft Card, Item and Empty); `bg-X-soft` is for controls and fills.
- Text on a background is `text-on-{background}`, computed by the provider with APCA: from the end
  of the scale toward the dark and the light side, then the ramp, then white or neutral 950, the
  first color that reaches Lc 75 under the hover and press layers. Text on a solid may be tinted.
- A brand or status color given as one color or a 50 to 950 ramp becomes two scales: the solid
  from ramp 600 outward until its text reaches Lc 75, the strong border the first step reaching
  Lc 45, text and strong text the first steps from the solid reaching Lc 60 and Lc 75 on base,
  surface, block and the family's soft. Dark surfaces sit at the lightness of the neutral step with
  the same number.
- `focus-ring` draws `ring-primary-strong/40 inset-ring-primary-strong`; invalid uses
  `danger-strong`.
- Flutter ports the same rules; `packages/core/tests/fixtures/theme-roles.json` checks 8-bit
  parity.

Breaking:

- `bg-neutral-subtlest` / `text-on-neutral-subtlest` → `bg-base` / `text-on-base`.
- `bg-neutral-subtler` and the component token `bg-band` → role `bg-block`. The component token
  `bg-panel` → role `bg-surface`; `shadow-panel` → `shadow-surface`.
- `bg-X-subtle` / `text-on-X-subtle` → `bg-X-soft` / `text-on-X-soft`. `bg-X-subtler` /
  `text-on-X-subtler` are removed; use the soft pair.
- `bg-X` / `text-on-X` → `bg-X-solid` / `text-on-X-solid`; `bg-neutral-bold` /
  `text-on-neutral-bold` → `bg-neutral-solid` / `text-on-neutral-solid`.
- `text-neutral-bold` → `text-neutral-strong`.
- Brand and status `border-X` is now a pale line (step 5); the colored line that reads is
  `border-X-strong`. The handle `bg-neutral` → `bg-(--ids-color-border-neutral-strong)`.
- Scheme slots are `bg-scheme-soft`, `bg-scheme-solid`, `text-on-scheme-soft`,
  `text-on-scheme-solid`, `text-scheme`, `text-scheme-strong`, `border-scheme`,
  `border-scheme-strong`.
- Component tokens: `bg-control-outline` and `bg-field-outline` are `bg-block` in dark, their
  borders and `border-field-bar` `border-neutral-strong`; `bg-field-code-outline` is `bg-surface` in
  dark.
- `text-on-*` variables have no CSS fallback; the provider writes them.
- `IdsPalette` and `createIdsPalette(color)` hold `{ light, dark }` scales of nine colors. The 50 to
  950 ramp is `createIdsRamp(color)`, typed `IdsRamp` and `IdsRampStep` (was `IdsPalette` and
  `IdsPaletteStep`). `IdsScale` and `IdsScaleStep` are new.
- Flutter: the 50 to 950 class `IdsPalette` is renamed `IdsRamp`; `IdsPalette(light:, dark:)` now
  takes nine colors per mode. `IdsColors` fields follow the roles (`bgBase`, `bgSurface`,
  `bgBlock`, `bgNeutralSoft`, `bgPrimarySolid`, `textOnPrimarySolid`, `borderPrimaryStrong`,
  `textNeutralStrong`, …); `IdsComponentColors.bgPanel` and `bgBand` are removed and
  `IdsComponentShadows.shadowPanel` is `shadowSurface`. `IdsColorRoles.neutralSteps` maps a role
  to a scale step and `neutralScales` holds the neutral values.
- `packages/core/tokens/semantic/neutral.{light,dark}.json` is replaced by
  `packages/core/neutral-roles.json`.
