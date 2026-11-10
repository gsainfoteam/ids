# IDS theme

`IdsPalette` takes eleven opaque sRGB shades from the app. There is no built-in brand palette. `resolve` selects roles by the IDS-19 contrast rules. `check()` reports invalid colors and roles for both brightness modes.

`palette_contrast.dart` keeps the Oklab conversion local because Flutter has no Oklab color interpolation API. Its matrices match Culori 4's `convertLrgbToOklab` and `convertOklabToLrgb`, used by React's contrast tests. Hover and press backgrounds mix 6% and 12% toward primary in Oklab, not sRGB. Changing the interpolation changes which shade passes contrast. The palette tests compare the historical 102 foreground roles and independently check tint contrast with Culori-generated data.

`IdsThemeData` configures radius, sans and mono font families, and round or squircle corners. `textStyle` replaces the token's bundled font inside an IDS component. It does not change Material or Cupertino themes. `dimension` currently preserves logical pixels; scale policy is pending in IDS-24. There is no public scale setting, font-size scaling, radius scaling, or invented scale range. Components route their dimensions through this method so a later policy has one entry point. System text scaling stays in Flutter's text layout.


`IdsProvider` owns uncontrolled values and delegates inherited setters to the nearest provider that owns that axis. Controlled setters only report the requested value. Defaults initialize once. `IdsScope` stores the requested mode, resolved theme, formatting locale and translation object. Locale does not choose a translation. Replacing the translation object notifies IDS dependents; mutating one in place is not supported.

`IdsTheme` combines runtime palette roles with generated neutral and status colors. The provider caches this resolved object until its data, palette or resolved mode changes. It inserts no global text, icon or Material theme wrappers. Component defaults therefore stay inside IDS.

`textStyle` constructs a new TextStyle from the token's metrics and paint properties: Flutter's copyWith retains a bundled font package when its package argument is null, incorrectly looking up an app font inside ids_flutter. The resolved style has `inherit: false` because Text otherwise merges it with the ancestor's bundled font and restores that package. Supply the desired color when resolving a style. Provider widget tests inspect the final RichText style for default, service and external-package fonts in both sans and mono roles.
