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

- `bg-X-subtler` for every family: a band between the page and `subtle` (neutral 50 light, 900
  dark), for a Card or Dialog footer or a table header.
- `bg-neutral-bold` with `text-on-neutral-bold`, the inverted fill of Tooltip and a neutral solid
  Button or Badge.

Hover and press are no longer colors. The CSS package adds `state-layer`, `state-hover` and
`state-press`: the content color laid over the background at `--ids-state-hover` (6%) and
`--ids-state-press` (10%). Every IDS component draws its states this way, and IdsProvider picks
text that keeps its contrast under the layer, so a few solid fills (danger, tertiary) move one
step darker. Flutter exposes the same opacities as `IdsStateOpacity`.

Outline controls and fields in dark mode fill with `bg-neutral-subtler` instead of a 30% neutral
tint.
