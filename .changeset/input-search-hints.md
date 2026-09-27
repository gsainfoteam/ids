---
'@gsainfoteam/ids-react': minor
---

`Input type="search"` now draws a leading search icon and the shared `TextField.Clear`, which
shows only while there is something to clear, clears through a real edit and answers Escape;
the keyboard's enter key reads "search". `email` and `url` turn off auto-capitalization, auto
correction and spell checking so the phone keyboard leaves addresses alone. Children passed to a
search Input replace the default icon and Clear. Every routed field now takes `onValueChange`
for its value and `onChange` for the native event.

Breaking: the search Clear no longer holds its place while the field is empty and leaves the tab
order. `date`, `time`, `datetime-local` and `color` still fall back to text; use the dedicated
fields.
