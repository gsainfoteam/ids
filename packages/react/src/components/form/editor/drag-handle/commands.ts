import { NodeSelection, TextSelection } from '@tiptap/pm/state';

import type { EditorBlock } from '../blocks/catalog';
import type { Editor as TiptapEditor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

const after = (pos: number, node: ProseMirrorNode) => pos + node.nodeSize;

export function duplicateBlock(editor: TiptapEditor, pos: number, node: ProseMirrorNode) {
  editor.chain().insertContentAt(after(pos, node), node.toJSON()).run();
}

export function deleteBlock(editor: TiptapEditor, pos: number, node: ProseMirrorNode) {
  editor
    .chain()
    .deleteRange({ from: pos, to: after(pos, node) })
    .run();
}

const SLASH = '/';
const insideTheNewParagraphAfterTheSlash = 1 + SLASH.length;

export function insertBlockBelow(editor: TiptapEditor, pos: number, node: ProseMirrorNode) {
  const below = after(pos, node);
  editor
    .chain()
    .insertContentAt(below, { type: 'paragraph', content: [{ type: 'text', text: SLASH }] })
    .setTextSelection(below + insideTheNewParagraphAfterTheSlash)
    .run();
}

export function turnBlockInto(
  editor: TiptapEditor,
  block: EditorBlock,
  pos: number,
  node: ProseMirrorNode,
) {
  const selectTheText = editor
    .chain()
    .command(({ tr }) => {
      tr.setSelection(TextSelection.between(tr.doc.resolve(pos), tr.doc.resolve(after(pos, node))));
      return true;
    })
    .clearNodes();
  block
    .insert(selectTheText)
    .command(({ tr }) => {
      tr.setSelection(TextSelection.near(tr.selection.$to, -1));
      return true;
    })
    .run();
}

export function selectBlock(editor: TiptapEditor, pos: number) {
  editor.commands.setNodeSelection(pos);
}

const INSIDE_THE_LAST_CELL = 4;

export function keepTheCaretInTheTable(editor: TiptapEditor, pos: number, table: ProseMirrorNode) {
  const { from, to } = editor.state.selection;
  if (from > pos && to < after(pos, table)) return;
  editor
    .chain()
    .command(({ tr }) => {
      const lastCell = tr.doc.resolve(after(pos, table) - INSIDE_THE_LAST_CELL);
      tr.setSelection(TextSelection.near(lastCell, -1));
      return true;
    })
    .run();
}

export function moveBlock(editor: TiptapEditor, from: number, to: number) {
  const { state } = editor.view;
  const node = state.doc.nodeAt(from);
  if (!node || to === from || to === after(from, node)) return;

  const tr = state.tr.delete(from, after(from, node));
  const at = tr.mapping.map(to);
  tr.insert(at, node);
  tr.setSelection(NodeSelection.create(tr.doc, at));
  editor.view.dispatch(tr.scrollIntoView());
}
