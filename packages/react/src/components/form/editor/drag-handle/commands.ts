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

export function startDraggingBlock(editor: TiptapEditor, pos: number, event: DragEvent) {
  const { view } = editor;
  const selection = NodeSelection.create(view.state.doc, pos);
  view.dispatch(view.state.tr.setSelection(selection));

  const slice = selection.content();
  const { dom, text } = view.serializeForClipboard(slice);
  const block = view.nodeDOM(pos);

  event.dataTransfer?.clearData();
  event.dataTransfer?.setData('text/html', dom.innerHTML);
  event.dataTransfer?.setData('text/plain', text);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copyMove';
  if (block instanceof HTMLElement) event.dataTransfer?.setDragImage(block, 0, 0);

  view.dragging = { slice, move: true };
}
