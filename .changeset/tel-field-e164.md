---
'@gsainfoteam/ids-react': minor
---

TelField moves onto the shared text-control shell and reports its value as E.164:
`onValueChange` gets `+821012345678` whatever the input shows, `value` and `defaultValue` accept
E.164 or a national number read in the country, and the hidden input submits E.164. Pasted
`tel:` links, `(0)` trunk markers, `00` international prefixes and full-width digits read as
numbers, and a pasted international number replaces the entry through a real edit. Typing or
pasting a number that starts with `+` beside `TelField.CountrySelect` switches the country; the
list shows country names in the new `locale` prop (default `ko-KR`) and finds them by name, ISO
code or calling code, and its trigger draws "KR +82" and the arrow with `Select.Value` and
`Select.Icon`. An incomplete or impossible number fails native validation with a message
that `Field.Error` shows. `format="international"` settles a complete number into international
form when the field is left. Adds `TelField.Clear` and function-valued `className` / `style`;
the strings live in the shared messages and are overridable on the parts.

Breaking: `onChange` is now the native input event; the value callback is `onValueChange`, and
its value is always E.164 where `format="auto"` used to report the formatted national text.
`format` only changes what the input shows. The country select's default label is "국가".
