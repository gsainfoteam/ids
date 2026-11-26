---
"@gsainfoteam/ids-react": major
---

Editor splits into `Editor` and `BlockEditor`, and takes its extensions from a `useEditor()` hook.

- `<Editor type="block">` is `<BlockEditor>`, exported from `@gsainfoteam/ids-react/editor`. Its
  parts are `BlockEditor.Content`, `.Count`, `.BubbleMenu` and the tools a bubble menu holds:
  `.Bold`, `.Italic`, `.Underline`, `.Strike`, `.Code`, `.Highlight`, `.Subscript`,
  `.Superscript`, `.Color`, `.Link`, `.TextAlign` and `.Separator`. `type` is gone, and
  `<Editor>` is always the toolbar editor.
- `BlockEditor.BubbleMenu` without children shows the block editor's default tools (bold, italic,
  underline, strike, code, color, link), the same as the menu drawn when no BubbleMenu is placed.
- `onImageUpload` and `mentions` move into `useEditor()`. Each feature is on when its object is
  given:

  ```tsx
  const editor = useEditor({
    imageUpload: { onUpload: async (file) => url },
    mentions: { find: (query, signal) => people },
  });

  <Editor editor={editor} />;
  <BlockEditor editor={editor} />;
  ```

- `invalid` is gone. Pass `aria-invalid`; inside a `Field` the field's invalid state applies.
- The root's `data-type` attribute is gone.
