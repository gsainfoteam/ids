---
'@gsainfoteam/ids-css': major
'@gsainfoteam/ids-react': major
'ids_flutter': major
---

The message catalog holds only accessible names and announcements: 364 keys become 201 (124
outside Editor). Visible text is the app's.

- Empty and limit parts (`DataTable.Empty`, `Select.Empty`, `PasswordField.CapsLock`, ...) render
  only their children and have no default text. `FileField.Limits` and `FileField.Rejection` are
  new parts that take a function of the limits or the rejected file.
- Date field names, relative days and weeks, percents, signs, units and ratios come from `Intl`
  (`DisplayNames`, `RelativeTimeFormat`, `NumberFormat`) for the provider locale, not from the
  catalog.
- Repeated words share `common.*` keys (`common.close`, `common.clear`, `common.next`,
  `common.status.info`, `common.drag.start`, ...). Carousel, CodeBlock, ColorPicker, Chip, Toast and
  the resize handles use them, so their names are shorter ("이전", "복사", "크기 조절").
- Breadcrumb, Calendar, Pagination, QRCode, Sidebar, Scheduler, PromptInput, Stepper and
  MessageScroller require `aria-label` or `aria-labelledby`. OTPField, Rating and Chart warn in
  development without one.
- Kbd keeps names only for symbol keys; Tab, CapsLock, PgUp, PgDn, Home and End are drawn as text
  on macOS.
- Messages take plain `{name}` arguments only: no plural or select. English counts read
  "{count} selected", "Files: {count}", "Characters left: {remaining}".
- FormValue drops `message`: a required control shows the browser's own message, and NumberField,
  TelField and ChipField set `common.invalid` as their validity message.
- Flutter: `spinnerLabel` is `commonLoading`, `dialogClose` is `commonClose`, `chipFieldRemove` is
  `commonRemoveItem`.
