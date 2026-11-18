---
"@gsainfoteam/ids-react": minor
---

`Editor` takes images and more tools. `onImageUpload(file)` returns the URL of an uploaded image;
with it, `Editor.Image` picks files, pasted and dropped image files go through the same function,
a placeholder holds the spot while it uploads and a failed upload is reported in a toast. A
selected image takes its alt text from `Editor.Image`'s popover. Only `http(s)`, relative URLs and
URLs the upload returned become images, so `javascript:` and `data:` never do.

New tools: `Editor.Highlight`, `Editor.TaskList` (drawn as IDS Checkboxes), `Editor.HorizontalRule`,
`Editor.TextAlign` and `Editor.Table` (insert a table, add and delete rows and columns; GFM tables
in markdown). Highlight, task lists, alignment and tables load their Tiptap extension with
`import()` only when their part is in the Editor, and image uploading only with `onImageUpload`.
