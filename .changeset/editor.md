---
'@gsainfoteam/ids-react': minor
---

Add Editor, a rich text field on Tiptap 3, from the new `@gsainfoteam/ids-react/editor` entry,
so an app without it never bundles Tiptap, and an app with it loads Tiptap with `import()` only
when an Editor mounts. It takes an HTML, Markdown or JSON value, joins forms and Field, and draws
its toolbar, bubble menu, link popover and character count from IDS parts. The Post and Event
blocks use it in place of TextArea.
