---
'@gsainfoteam/ids-react': minor
---

IDS strings can now follow the app's language. `IdsProvider` takes `translate(key, values)`, where
the key is a stable dotted path such as `'dialog.close'`; an answer of `undefined` or the key itself
falls back to the Korean default, and a nested provider without `translate` inherits its parent's.
`IdsProvider locale` sets the locale for dates, times, numbers and country names, and a component's
own `locale` still wins. The package exports nested ICU catalogs `@gsainfoteam/ids-react/messages/ko.json`
and `/messages/en.json` to seed an app's translations, and the `IdsMessageKey` and `IdsTranslate`
types. `IdsProvider` no longer passes an HTML `translate` attribute through to its element.
Numbers inside the Korean defaults are now grouped by `ko-KR`, so a TextArea counter reads
`1,200 / 2,000`.
