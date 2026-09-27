---
'@gsainfoteam/ids-react': minor
---

NumberField reads and writes numbers with `@internationalized/number` instead of its own parser.
The formatted text stays on screen while the field has focus and is edited in place: grouping
separators, currency and unit signs, accounting parentheses, full-width and Arabic-Indic digits
are all understood. An edit, paste or autocorrection that cannot become a number in the field's
locale and format is refused before it lands, so the caret stays where it was, and a minus sign
is refused when `min` is 0 or more.

Breaking: focusing the field no longer swaps the formatted text for a plain edit form (`1,234.5`
stays `1,234.5`, not `1234.5`). A percent field is typed in percent: `25` means 0.25, where the
edit form used to be `0.25`. `formatOptions` no longer accepts `notation` or `compactDisplay`,
and a notation other than `standard` throws, because text such as `1.2E-6` cannot be parsed back.
