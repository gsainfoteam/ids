---
'@gsainfoteam/ids-react': minor
---

Breaking: `ThemeProvider` is now `IdsProvider`, with the same props (`color`, `mode`, their
defaults and callbacks, `asChild`), and `ThemeProvider.Mode`/`ThemeProvider.State` are now
`IdsProvider.Mode`/`IdsProvider.State`. `ThemeContext` and `useTheme` keep their names. The
provider is growing past the theme: it will host overlays and toasts and carry text direction, so
it is named after the design system rather than one of its jobs. There is no alias; replace the
import and the JSX name.
