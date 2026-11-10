# IDS theme

`IdsPalette` takes eleven opaque sRGB shades from the app. There is no built-in brand palette. `resolve` selects roles by the IDS-19 contrast rules. `check()` reports invalid colors and roles for both brightness modes.

`palette_contrast.dart` keeps the Oklab conversion local because Flutter has no Oklab color interpolation API. Its matrices match Culori 4's `convertLrgbToOklab` and `convertOklabToLrgb`, used by React's contrast tests. Hover and press backgrounds mix 6% and 12% toward primary in Oklab, not sRGB. Changing the interpolation changes which shade passes contrast. The palette tests compare the historical 102 foreground roles and independently check tint contrast with Culori-generated data.

`IdsThemeData` configures radius, sans and mono font families, and round or squircle corners. `textStyle` replaces the token's bundled font inside an IDS component. It does not change Material or Cupertino themes. `dimension` currently preserves logical pixels; scale policy is pending in IDS-24. There is no public scale setting, font-size scaling, radius scaling, or invented scale range. Components route their dimensions through this method so a later policy has one entry point. System text scaling stays in Flutter's text layout.
