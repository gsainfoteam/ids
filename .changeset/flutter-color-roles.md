---
"ids_flutter": major
---

Colors follow ids-react's roles: eight families (`neutral`, `primary`, `secondary`, `tertiary`,
`success`, `warning`, `danger`, `info`) with the same ten roles each, over `surface` and
`onSurface`, read as `IdsProvider.of(context).colors.bgPrimarySoft`.

- The roles are picked from the app's palettes by APCA contrast, with the same derived secondary
  and tertiary, tinted neutral and harmonized or fixed statuses as ids-react. Every role matches
  ids-react's 8-bit color for the 17 core palettes in both modes, both neutrals and both status
  options.
- `IdsColors` is generated from `packages/core/color-roles.json`. The old roles are gone:
  `secondary` / `onSecondary` → `bgPrimarySoft` / `textOnPrimarySoft`, `accent` → `textPrimary`,
  `outline` → `borderPrimary`, `muted` → `bgNeutralSoft`, `border` → `borderNeutral`, `danger` →
  `textDanger`.
- `checkIdsTheme` reports an out-of-range radius or scale, a palette with no shade that reaches
  the contrast, brand families too close to each other or to a status, and success or warning that
  look like danger under red-green color blindness.
- Divider, Label, Field and Spinner take their colors from the new roles: lines `borderNeutral`,
  secondary text `textNeutral`, errors `textDanger`.
