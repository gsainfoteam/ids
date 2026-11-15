---
"ids_flutter": major
---

Replace `ThemeProvider` with `IdsProvider(theme: IdsTheme(...))`, which takes the same theme as
ids-react's `defineIdsTheme`.

- `IdsTheme` holds `primary` (required), `secondary`, `tertiary`, `neutral`, `status`, `radius`,
  `cornerShape` and `scale`. Each brand color is an `IdsPalette` of eleven shades or
  `IdsThemeColor.seed(color)`. Flutter's `IdsColor` and its built-in hue tables are gone.
- `IdsProviderScope(theme: IdsThemeOverrides(...))` overrides part of the theme for a subtree, like
  `IdsProvider.Scope`. Nested providers inherit what they leave out.
- Mode is controlled (`mode`, `onModeChange`) or uncontrolled (`defaultMode`), and
  `IdsMode.system` follows the platform brightness. `setMode` and `toggleMode` reach the provider
  that owns the mode.
- `locale` and a slang `translation` object pass down separately. Fonts and colors apply only
  inside IDS components; Material and Cupertino themes are left alone.
- In development the provider prints the problems `checkIdsTheme` finds once per theme.
