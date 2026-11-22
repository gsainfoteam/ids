---
"@gsainfoteam/ids-react": minor
---

`Editor` takes images and more tools. `onImageUpload(file)` returns the URL of an uploaded image;
with it, `Editor.Image` picks files or takes an image address, pasted and dropped image files go
through the same function, a placeholder holds the spot while it uploads and a failed upload is
reported in a toast. A selected image takes its alt text from `Editor.Image`'s popover, and in
`html` and `json` it sits in a `Resizable` whose handle (or arrow keys) changes its width. Only `http(s)`, relative URLs and URLs the
upload returned become images, so `javascript:` and `data:` never do.

New tools: `Editor.Highlight`, `Editor.TaskList` (drawn as IDS Checkboxes), `Editor.HorizontalRule`,
`Editor.TextAlign`, `Editor.Table` (pick a size from a grid; add and delete rows and columns; outside
markdown, toggle the header row and merge and split cells), `Editor.Callout` (the four IDS statuses, saved as GitHub alerts in
markdown) and `Editor.Details` (a toggle block). Blocks in the Editor are drawn like the IDS
components RichText renders: code blocks as `CodeBlock` (with its copy button and a language
Select), callouts as `Alert`, toggle blocks as `Accordion` and tables as `Table`. Each of these loads its Tiptap extension with `import()` only when
its part is in the Editor, and image uploading only with `onImageUpload`.

An editable Editor opens a block menu on `/`. `type="block"` makes a block editor: no toolbar,
every block in the `/` menu, a default BubbleMenu and a handle outside the Editor's left edge
beside the hovered block, with no gutter inside the box. The default `type="toolbar"` sets its
bars on a gray tray around the document card, like DataTable. It drags the block the
way Sidebar drags an item (a copy follows the pointer, a primary line marks the drop) or opens a
menu to insert, turn into, duplicate or delete it. A selected block takes a light primary tint
instead of an outline. `mentions(query, signal)` turns on `@` mentions, drawn as an avatar and a
name and saved as `[@ id="" label="" avatar=""]` in markdown. Lists and blank paragraphs
pasted from Word and Google Docs are cleaned up.

Add `RichText` from the new `@gsainfoteam/ids-react/rich-text` entry. It draws saved markdown or
Editor JSON with IDS components (CodeBlock, Alert, Accordion, Table, Image, Checkbox, Avatar, Link)
and has no hooks, so a Server Component renders a post without sending Tiptap to the browser. It
shares the Editor's schema and text styles.
