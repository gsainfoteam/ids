---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
'ids_flutter': minor
---

Color roles are named by grammar only: `{bg|text|border}-{family}[-{strength}]` and
`text-on-{family}[-{strength}]`, with strengths `subtlest` < `subtler` < `subtle` < (none) < `bold`.

| Before | After |
| --- | --- |
| `bg-surface`, `--ids-color-surface` | `bg-neutral-subtlest`, `--ids-color-bg-neutral-subtlest` |
| `text-on-surface`, `--ids-color-on-surface` | `text-neutral-bold`, `--ids-color-text-neutral-bold` |
| `bg-X-soft` | `bg-X-subtle` |
| `text-on-X-soft` | `text-on-X-subtle` |
| `bg-X-hover`, `bg-X-active`, `bg-X-soft-hover`, `bg-X-soft-active` | removed, use the state layer |
| Flutter `colors.surface`, `colors.onSurface` | `colors.bgNeutralSubtlest`, `colors.textNeutralBold` |
| Flutter `bgXSoft`, `textOnXSoft` | `bgXSubtle`, `textOnXSubtle` |

New roles:

- `bg-X-subtler` with `text-on-X-subtler` for every family: a band between the page and `subtle`
  (neutral 50 light, 900 dark), for a Card or Dialog footer or a table header.
- `text-on-neutral-subtlest`, so every background `bg-X[-strength]` has its text
  `text-on-X[-strength]`.
- `bg-neutral-bold` with `text-on-neutral-bold`, the inverted fill of Tooltip and a neutral solid
  Button or Badge.

Hover and press are no longer colors. The CSS package adds `state-layer`, `state-hover` and
`state-press`, which lay a color over the background. Its color depends on the surface, so a
colored control deepens in its own hue instead of turning gray:

- a fill (solid Button, Chip, Badge, a selected Calendar day) takes `state-fill`, black at 10% on
  hover and 18% on press;
- a colored soft surface and a status outline or ghost take the family fill at 8% and 12%
  (`--ids-state-tint-hover`, `--ids-state-tint-press`);
- everything else takes its text color at 6% and 10% (`--ids-state-hover`, `--ids-state-press`).

Every IDS component draws its states this way, and IdsProvider picks text that keeps its contrast
under the layer it sits on. Flutter exposes the same values as `IdsStateOpacity` and
`IdsStateLayer.fillColor`.

Outline controls and fields in dark mode fill with `bg-neutral-subtle` with a `bg-neutral` border
instead of a 30% neutral tint, so they stay lighter than a band.
