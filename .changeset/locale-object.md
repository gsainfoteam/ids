---
'@gsainfoteam/ids-css': major
'@gsainfoteam/ids-react': major
'ids_flutter': major
---

`IdsProvider` and `IdsProvider.Scope` take one `locale` object in place of `translate` and the
`locale` string.

```tsx
import { en } from '@gsainfoteam/ids-react/locales/en';

<IdsProvider theme={theme} locale={en} />
```

- A locale is `{ language, tag, messages }`. `tag` is the BCP 47 tag for dates, times, numbers and
  country names and must start with `language`; a tag of another language warns once in
  development.
- IDS ships `ko` (the default) and `en` at `@gsainfoteam/ids-react/locales/ko` and `/locales/en`.
- `defineIdsLocale` checks a locale's type. A full language uses `satisfies IdsMessages`; a partial
  `messages` needs `base`, which supplies the rest.
- A message is a string with `{name}` arguments or a function of typed arguments
  (`({ count }) => …`). Number arguments are formatted with the tag.
- A nested provider with `locale` replaces the whole object. To change only the format, spread a
  locale: `{ ...ko, tag: 'ko-KR-u-fw-mon' }`.
- Removed: `translate`, the `IdsTranslate` type, the `locale` props of Message and Scheduler, and
  the `messages/ko.json` and `messages/en.json` exports.
- NumberField falls back to `ko-KR` like every other component, not `en-US`.
