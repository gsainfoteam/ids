---
'@gsainfoteam/ids-react': minor
---

FileField takes files pasted from the clipboard, shows image previews whose object URLs are
revoked when the file is removed or the field unmounts, and keys files by the File itself so a
removal never hands one file's preview to the next. A drag stays one drag while it crosses the
field's children, removing a listed file keeps focus on the file that takes its place, and sizes
and limits read in familiar units (`1.5 KB`, `최대 5 MB`). A dropzone shows the accepted types and
limits before anything is rejected.

Adds `FileField.Remove`, `FileField.Preview`, a function of the files as `FileField.List`
children, a function of `{ file, index }` as `FileField.Item` children, a function `className`,
and `data-*` state. `required` is enforced by the browser's own validation.

Breaking: `onChange(value)` is now `onValueChange(value)`. `variant="dropzone"` is now
`appearance="dropzone"`, and `variant` is the fill of either appearance: `outline`, `soft` or
`ghost`. In the field appearance Clear sits inside the field's border, and several files read as
a count. A dropzone lists its file in single mode too and has no Clear by default.
