import type { CSSProperties } from 'react';

import { minBy } from 'es-toolkit';

import { topLevelBlocks } from './extension';

import type { HoveredBlock } from './store';
import type { Editor as TiptapEditor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';

export type BlockAction = (editor: TiptapEditor, pos: number, node: ProseMirrorNode) => void;

type Gap = { pos: number; y: number };

export type DropLine = { pos: number; style: CSSProperties };

export type Dragged = { block: HoveredBlock; clone: Node; box: CSSProperties };

export const isATable = (node: ProseMirrorNode) => node.type.name === 'table';

const FIRST_LINE = 'p,h1,h2,h3,h4,h5,h6,pre,[data-type=detailsSummary]';
const REACH_BEYOND_THE_BLOCKS = 36;
const PREVIEW_PADDING = 8;

function firstLineOf(block: HTMLElement) {
  const line = block.matches(FIRST_LINE) ? block : (block.querySelector(FIRST_LINE) ?? block);
  const style = getComputedStyle(line);
  const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2;
  const top =
    line.getBoundingClientRect().top +
    Number.parseFloat(style.paddingTop) +
    Number.parseFloat(style.borderTopWidth);
  return { top, height: lineHeight };
}

export const editorRootOf = (element: Element) => element.closest<HTMLElement>('[data-editor]');

export function besideTheFirstLine(block: HTMLElement, handle: HTMLElement): CSSProperties {
  const line = firstLineOf(block);
  const documentTop = block.closest('[data-editor-document]')?.getBoundingClientRect().top ?? 0;
  return { top: line.top - documentTop + (line.height - handle.offsetHeight) / 2 };
}

export const handBackFocusTo = (editor: TiptapEditor, handle: HTMLElement | null) =>
  queueMicrotask(() => {
    const focused = handle?.ownerDocument.activeElement;
    if (!editor.isDestroyed && (focused === handle || focused === handle?.ownerDocument.body))
      editor.commands.focus();
  });

function gapsBetweenTheBlocks(view: EditorView): Gap[] {
  const blocks = topLevelBlocks(view);
  const rects = blocks.map((block) => block.dom.getBoundingClientRect());
  const last = rects.at(-1);
  if (!last) return [];
  return [
    ...blocks.map((block, index) => ({
      pos: block.pos,
      y: index === 0 ? rects[0]!.top : (rects[index - 1]!.bottom + rects[index]!.top) / 2,
    })),
    { pos: view.state.doc.content.size, y: last.bottom },
  ];
}

function isNearTheBlocks(view: EditorView, { x, y }: { x: number; y: number }) {
  const box = view.dom.getBoundingClientRect();
  return (
    x >= box.left - REACH_BEYOND_THE_BLOCKS &&
    x <= box.right + REACH_BEYOND_THE_BLOCKS &&
    y >= box.top - REACH_BEYOND_THE_BLOCKS &&
    y <= box.bottom + REACH_BEYOND_THE_BLOCKS
  );
}

function lineAt(view: EditorView, gap: Gap, origin: Element): CSSProperties {
  const content = view.dom.getBoundingClientRect();
  const style = getComputedStyle(view.dom);
  const start = Number.parseFloat(style.paddingInlineStart);
  const end = Number.parseFloat(style.paddingInlineEnd);
  const box = origin.getBoundingClientRect();
  return {
    top: gap.y - box.top,
    left: content.left + start - box.left,
    width: content.width - start - end,
  };
}

export function dropLineFor(
  view: EditorView,
  block: HoveredBlock,
  pointer: { x: number; y: number },
  origin: Element,
): DropLine | null {
  const node = view.state.doc.nodeAt(block.pos);
  if (!node || !isNearTheBlocks(view, pointer)) return null;
  const gap = minBy(gapsBetweenTheBlocks(view), (candidate) => Math.abs(candidate.y - pointer.y));
  if (!gap || gap.pos === block.pos || gap.pos === block.pos + node.nodeSize) return null;
  return { pos: gap.pos, style: lineAt(view, gap, origin) };
}

export function draggedFrom(block: HoveredBlock, handle: HTMLElement): Dragged {
  const from = block.dom.getBoundingClientRect();
  const grip = handle.getBoundingClientRect();
  return {
    block,
    clone: block.dom.cloneNode(true),
    box: {
      width: from.width + PREVIEW_PADDING * 2,
      marginLeft: from.left - grip.left - PREVIEW_PADDING,
      marginTop: from.top - grip.top - PREVIEW_PADDING,
    },
  };
}
