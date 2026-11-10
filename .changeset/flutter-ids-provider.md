---
"ids_flutter": major
---

Replace ThemeProvider with IdsProvider and require an app theme and palette at the outer scope. Remove Flutter's built-in IdsColor and hue tables. Support controlled and uncontrolled palette/mode, nested inheritance, system brightness, locale and slang translation objects. Apply fonts and colors only inside IDS components and route Spinner defaults through the generated Korean catalog.

Migrate theme reads to IdsProvider.of(context).theme. Use defaultPalette for locally mutable palette state. Scale remains deferred pending IDS-24.
