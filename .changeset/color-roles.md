---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
---

Breaking: colors are eight families with the same ten roles, and the utility prefix states the
property. The families are `neutral`, `primary`, `secondary`, `tertiary`, `success`, `warning`,
`danger` and `info`; each has `bg-X`, `bg-X-hover`, `bg-X-active`, `bg-X-soft`,
`bg-X-soft-hover`, `bg-X-soft-active`, `text-on-X`, `text-on-X-soft`, `text-X` and `border-X`,
over `bg-surface` / `text-on-surface`. The variables are `--ids-color-<role>`, each Tailwind
namespace maps only the roles that fit it, and no shared `--color-<role>` is emitted.

- Renamed: `secondary` / `on-secondary` → `bg-primary-soft` / `text-on-primary-soft`, `accent` →
  `text-primary`, `outline` → `border-primary`, `muted` → `bg-neutral-soft` (and `-hover`,
  `-active`), `on-muted` → `text-neutral`, `border` → `border-neutral`, `handle` → `bg-neutral`
  (and `-hover`, `-active`), `{status}` / `on-{status}` → `bg-{status}` / `text-on-{status}`,
  `{status}-strong` → `text-{status}`, status tints → `bg-{status}-soft` with
  `text-on-{status}-soft`.
- `defineIdsTheme` takes `primary` (required, replaces `palette`), `secondary?`, `tertiary?`,
  `neutral?: 'pure' | 'tinted'` and `status?: 'harmonized' | 'fixed' | { success?, warning?,
  danger?, info? }`. A missing `secondary` or `tertiary` is derived from primary: secondary at primary's hue with a third of its chroma ratio, tertiary turned +60° (−60° when that lands on a status). `'tinted'` gives the
  neutral the primary hue at low chroma. `'harmonized'` (the default) turns each status hue toward
  primary by at most 15°, or half the distance, inside its hue range.
- `checkIdsTheme` also reports brand families too close to each other or to a status, a status
  hue outside its range, and success or warning that look like danger under red-green color
  blindness.
- Every `colorScheme` takes `secondary` and `tertiary`: Button, IconButton, IconToggle, Toggle,
  FloatingButton, Badge, Chip, Alert, Progress, Toast, Tabs (new `colorScheme`), Link, Sidebar,
  Carousel and MessageScroller. Link's `'accent'` is now `'primary'`.
- Chart drops `chart-1` to `chart-5`. A series without `color` takes `bg-primary`,
  `bg-secondary` and `bg-tertiary` in config order; a fourth draws in neutral and warns in
  development. `color` takes a family
  name or any CSS color; `'accent'` and `'on-muted'` are gone (`'primary'`, `'neutral'`).
