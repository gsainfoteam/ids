'use client';

import { useRef, useState, useSyncExternalStore } from 'react';

import { getEventCoordinates } from '@dnd-kit/utilities';

import { useInternalEditorBlockHandleLeave } from './use-editor-block-handle-leave';
import { useInternalEditorBlockHandlePlace } from './use-editor-block-handle-place';
import { useInternalDragSensors } from '../../../../internal/lib/drag-sensors';
import { swallowTheClickThatEndsADrag } from '../../../../internal/lib/drag-surface';
import { blocksAvailableIn, turnsIntoOtherBlocks } from '../blocks/catalog';
import { keepTheCaretInTheTable, moveBlock, selectBlock } from '../drag-handle/commands';
import { markTheDraggedBlock } from '../drag-handle/extension';
import {
  draggedFrom,
  dropLineFor,
  handBackFocusTo,
  isATable,
  type BlockAction,
  type Dragged,
  type DropLine,
} from '../drag-handle/geometry';

import type { BlockHoverStore, HoveredBlock } from '../drag-handle/store';
import type { DragMoveEvent } from '@dnd-kit/core';
import type { Editor as TiptapEditor } from '@tiptap/core';

export function useInternalEditorBlockHandle(
  store: BlockHoverStore,
  editor: TiptapEditor | null,
  editable: boolean,
) {
  const hovered = useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
  const [menuBlock, setMenuBlock] = useState<HoveredBlock | null>(null);
  const [dragged, setDragged] = useState<Dragged | null>(null);
  const [line, setLine] = useState<DropLine | null>(null);
  const grabbedRef = useRef<HoveredBlock | null>(null);
  const draggedRef = useRef<Dragged | null>(null);
  const lineRef = useRef<DropLine | null>(null);
  const block = menuBlock ?? dragged?.block ?? hovered;
  const [handleRef, place] = useInternalEditorBlockHandlePlace(block);
  const node = block && editor?.state.doc.nodeAt(block.pos);
  const sensors = useInternalDragSensors({ touch: false });

  useInternalEditorBlockHandleLeave(store, handleRef);

  const shown = editable && editor !== null && node != null && block !== null;
  const turnInto = shown && turnsIntoOtherBlocks(node) ? blocksAvailableIn(editor) : [];

  const run = (action: BlockAction) => () => {
    if (!editor || !block || !node) return;
    editor.view.focus();
    action(editor, block.pos, node);
  };

  const showLine = (next: DropLine | null) => {
    lineRef.current = next;
    setLine(next);
  };

  const followThePointer = ({ activatorEvent, delta }: DragMoveEvent) => {
    const start = getEventCoordinates(activatorEvent);
    const origin = editor?.view.dom.closest('[data-editor-document]');
    const from = draggedRef.current?.block;
    if (!editor || !from || !start || !origin) return showLine(null);
    const pointer = { x: start.x + delta.x, y: start.y + delta.y };
    showLine(dropLineFor(editor.view, from, pointer, origin));
  };

  const endTheDrag = () => {
    if (editor && !editor.isDestroyed) markTheDraggedBlock(editor.view, null);
    draggedRef.current = null;
    setDragged(null);
    showLine(null);
  };

  const startTheDrag = () => {
    const handle = handleRef.current;
    const grabbed = grabbedRef.current;
    if (!editor || !grabbed || !handle) return;
    const next = draggedFrom(grabbed, handle);
    draggedRef.current = next;
    setDragged(next);
    markTheDraggedBlock(editor.view, grabbed.pos);
  };

  const dropTheBlock = () => {
    const from = draggedRef.current?.block.pos;
    const to = lineRef.current?.pos;
    endTheDrag();
    swallowTheClickThatEndsADrag();
    if (editor && from !== undefined && to !== undefined) moveBlock(editor, from, to);
  };

  const onMenuOpenChange = (open: boolean) => {
    if (open && editor && block && node) {
      if (isATable(node)) keepTheCaretInTheTable(editor, block.pos, node);
      else selectBlock(editor, block.pos);
    }
    setMenuBlock(open ? block : null);
    if (!open && editor) handBackFocusTo(editor, handleRef.current);
  };

  const grab = () => {
    grabbedRef.current = block;
  };

  return {
    sensors,
    handleRef,
    place,
    node,
    shown,
    turnInto,
    menuOpen: menuBlock !== null,
    dragged,
    line,
    run,
    followThePointer,
    startTheDrag,
    dropTheBlock,
    endTheDrag,
    onMenuOpenChange,
    grab,
  };
}
