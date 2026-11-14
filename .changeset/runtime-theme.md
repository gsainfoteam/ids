---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
---

Breaking: the app now owns its theme. `IdsProvider` takes a required `theme` built with
`defineIdsTheme({ palette, radius, font, cornerShape })`, where `palette` is the app's brand
palette from `50` to `950`. The provider picks `primary`, `on-primary`, `secondary`,
`on-secondary`, `accent` and `outline` for both modes by contrast (4.5:1) and writes them on its
root as `--ids-theme-{light|dark}-{role}`; `ids.css` maps the current mode's set onto
`--ids-color-{role}`. Neutral, status and chart colors stay IDS's.

- Removed: the `color`, `defaultColor` and `onColorChange` props, `setColor` and `color` on
  `useTheme()`, the `data-color` attribute and its 17 `[data-color]` blocks in `ids.css`, and the
  `IdsColor` type. Pass `theme={defineIdsTheme({ palette })}` instead.
- `radius` (0 to 18, default 10) sets `--ids-radius-standard` and derives `indicator` and
  `container` from it. `font.sans` and `font.mono` set the font families; the app loads the
  fonts. `cornerShape: 'squircle'` sets CSS `corner-shape` under the provider, where the browser
  supports it; `rounded-full` stays round.
- `IdsProvider.Scope` overrides any part of the theme, or the mode, for a subtree. A plain nested
  `IdsProvider` still works but needs a whole theme.
- `checkIdsTheme(theme)` returns the problems the provider warns about in development: missing or
  invalid steps, a palette with no step that reaches 4.5:1 for a role, and out-of-range values.
- The Tailwind bridges are now `@theme inline`: utilities such as `bg-primary`, `rounded-standard`
  and `font-sans` read `var(--ids-…)` directly, so a provider's variables reach them. `--color-*`,
  `--radius-*`, `--font-*` and `--text-*` are no longer emitted on `:root`; read the `--ids-*`
  variables instead.
