---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
---

Breaking: the app now owns its theme. `IdsProvider` takes a required `theme` built with
`defineIdsTheme({ palette, radius, cornerShape, scale })`, where `palette` is the app's brand
palette from `50` to `950`. The provider picks `primary`, `on-primary`, `secondary`,
`on-secondary`, `accent` and `outline` for both modes by contrast (4.5:1) and writes them on its
root as `--ids-theme-{light|dark}-{role}`; `ids.css` maps the current mode's set onto
`--ids-color-{role}`. Neutral, status and chart colors stay IDS's.

- Removed: the `color`, `defaultColor` and `onColorChange` props, `setColor` and `color` on
  `useTheme()`, the `data-color` attribute and its 17 `[data-color]` blocks in `ids.css`, and the
  `IdsColor` type. Pass `theme={defineIdsTheme({ palette })}` instead.
- `radius` (0 to 18, default 10) sets the standard corner and derives `indicator` and
  `container` from it. `cornerShape: 'squircle'` sets CSS `corner-shape` under the provider,
  where the browser supports it; `rounded-full` stays round.
- The fonts stay IDS's: Pretendard GOV and Geist Mono, which `@gsainfoteam/ids-css` now ships.
  The type scale, the mono x-height adjustment and Kbd's alignment are measured on them.
- `palette` also takes one CSS color. IDS builds the 11 steps from its hue and chroma: lightness
  and chroma per step come from the two reference palettes nearest in hue, the result is clamped
  to sRGB by chroma and rounded to 8-bit hex, and step 600 moves to the nearest lightness where
  white or dark text reaches 4.5:1. `createIdsPalette(color)` returns the same palette.
- `scale` (0.5 to 2, default 1) multiplies spacing, text sizes, the size tokens and radius under the
  provider, rounded to whole pixels with CSS `round()`; borders, rings and shadows stay. A nested
  scale replaces the outer one. Overlay offsets and widths follow it too. Component sizes
  written in px or rem now use `--spacing()`, so they scale with the rest.
- The provider writes the radius as `--ids-theme-radius-*`; `ids.css` derives `--ids-radius-*`
  from it and the scale.
- `IdsProvider.Scope` overrides any part of the theme, or the mode, for a subtree. A plain nested
  `IdsProvider` still works but needs a whole theme.
- `checkIdsTheme(theme)` returns the problems the provider warns about in development: missing or
  invalid steps, a palette with no step that reaches 4.5:1 for a role, and out-of-range values.
- The Tailwind bridges are now `@theme inline`: utilities such as `bg-primary`, `rounded-standard`
  and `font-sans` read `var(--ids-…)` directly, so a provider's variables reach them. `--color-*`,
  `--radius-*`, `--font-*` and `--text-*` are no longer emitted on `:root`; read the `--ids-*`
  variables instead.
- The minimum Chrome and Edge is now 125, the first with CSS `round()`, which keeps scaled sizes on
  whole pixels. Firefox 128 and Safari 18 already have it.
