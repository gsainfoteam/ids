---
'@gsainfoteam/ids-react': minor
---

IdsProvider takes `color` / `mode` as controlled props with `defaultColor` / `defaultMode` and
`onColorChange` / `onModeChange`. `mode="system"` follows `prefers-color-scheme` live and renders
light on the server without a hydration mismatch. A nested provider inherits whichever axis it
does not set, its setters reach the provider that owns that axis, and a region that switches mode
paints its own surface. `useTheme()` also returns `resolvedMode`, and `asChild` puts the
attributes on the child instead of a wrapping div.

Breaking: `color` and `mode` are no longer initial values. A provider given `mode` without
`onModeChange` stays on that mode; pass `defaultMode` for the old behavior. `ThemeContext` now
carries `resolvedMode`, and `mode` can be `'system'`.
