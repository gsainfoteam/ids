---
'@gsainfoteam/ids-css': major
'@gsainfoteam/ids-react': major
'ids_flutter': major
---

ids_flutter's `IdsProvider` and `IdsProviderScope` take one `IdsLocale` in place of `translation`
and the `Locale`.

```dart
IdsProvider(theme: appTheme, locale: IdsLocale.en, child: child)
```

- `IdsLocale` pairs a `Locale` with an `IdsMessagesBase`. `IdsLocale.ko` (ko-KR) and
  `IdsLocale.en` (en-US) ship with the package; a locale whose language differs from its messages
  fails an assert.
- Without `locale`, the outermost provider follows `Localizations.maybeLocaleOf(context)` when a
  shipped language matches it, and falls back to `IdsLocale.ko`.
- To change a few strings, extend a shipped class (`class AppMessages extends IdsMessagesEn`). A
  new language extends `IdsMessagesBase`, which makes every message required.
- `IdsProvider.of(context).messages` reads the current messages.
- Removed: the `IdsMessages` slang mixin, `translation`, `messages/ko.i18n.json` and the slang
  dev dependency.
