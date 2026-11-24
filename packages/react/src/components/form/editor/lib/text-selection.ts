import type { CSSProperties } from 'react';

import type { Editor as TiptapEditor } from '@tiptap/core';

export type TextSelection = { from: number; to: number; focused: boolean };

export function selectedText(editor: TiptapEditor): TextSelection | null {
  const { selection } = editor.state;
  const textOnly = 'node' in selection === false;
  if (selection.empty || !textOnly) return null;
  return { from: selection.from, to: selection.to, focused: editor.isFocused };
}

export function rectAround(editor: TiptapEditor, { from, to }: TextSelection, box: DOMRect) {
  const start = editor.view.coordsAtPos(from);
  const end = editor.view.coordsAtPos(to, -1);
  const oneLine = Math.abs(start.top - end.top) < 1;
  const left = oneLine ? Math.min(start.left, end.left) : box.left;
  const right = oneLine ? Math.max(start.right, end.right) : box.right;
  return {
    top: start.top - box.top,
    left: left - box.left,
    width: Math.max(right - left, 1),
    height: Math.max(end.bottom - start.top, 1),
  } satisfies CSSProperties;
}
