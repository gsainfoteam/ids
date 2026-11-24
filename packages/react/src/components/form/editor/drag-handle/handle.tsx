'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type CSSProperties,
  type RefCallback,
  type RefObject,
} from 'react';

import { DndContext, DragOverlay, useDraggable, type DragMoveEvent } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';
import {
  ArrowPathIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/16/solid';
import { minBy } from 'es-toolkit';
import { GripVertical } from 'lucide-react';

import {
  deleteBlock,
  duplicateBlock,
  insertBlockBelow,
  keepTheCaretInTheTable,
  moveBlock,
  selectBlock,
  turnBlockInto,
} from './commands';
import { markTheDraggedBlock, topLevelBlocks } from './extension';
import { useDragSensors } from '../../../../internal/drag-sensors';
import { swallowTheClickThatEndsADrag } from '../../../../internal/drag-surface';
import { useTranslate } from '../../../../internal/translate';
import { cn, mergeRefs } from '../../../../utils';
import { Menu } from '../../../overlay/menu';
import { blocksAvailableIn, turnsIntoOtherBlocks } from '../blocks/catalog';
import { useEditorContext } from '../context';
import { EditorGlyphButton } from '../glyph-button';
import { editorMessages } from '../messages-catalog';
import { EditorTableMenuItems } from '../table/edit-menu';

import type { BlockHoverStore, HoveredBlock } from './store';
import type { Editor as TiptapEditor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';

type BlockAction = (editor: TiptapEditor, pos: number, node: ProseMirrorNode) => void;

type Gap = { pos: number; y: number };

type DropLine = { pos: number; style: CSSProperties };

type Dragged = { block: HoveredBlock; clone: Node; box: CSSProperties };

const isATable = (node: ProseMirrorNode) => node.type.name === 'table';

const FIRST_LINE = 'p,h1,h2,h3,h4,h5,h6,pre,[data-type=detailsSummary]';
const DRAG_ID = 'ids-editor-block';
const REACH_BEYOND_THE_BLOCKS = 36;
const PREVIEW_PADDING = 8;
const SILENT = {
  announcements: {
    onDragStart: () => undefined,
    onDragOver: () => undefined,
    onDragEnd: () => undefined,
    onDragCancel: () => undefined,
  },
  screenReaderInstructions: { draggable: '' },
};

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

const editorRootOf = (element: Element) => element.closest<HTMLElement>('[data-editor]');

function besideTheFirstLine(block: HTMLElement, handle: HTMLElement): CSSProperties {
  const line = firstLineOf(block);
  const documentTop = block.closest('[data-editor-document]')?.getBoundingClientRect().top ?? 0;
  return { top: line.top - documentTop + (line.height - handle.offsetHeight) / 2 };
}

function useBesideTheFirstLine(block: HoveredBlock | null) {
  const handleRef = useRef<HTMLButtonElement>(null);
  const [place, setPlace] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    const handle = handleRef.current;
    if (!handle || !block) return;

    const follow = () => setPlace(besideTheFirstLine(block.dom, handle));
    follow();
    const resizes = new ResizeObserver(follow);
    resizes.observe(block.dom);
    return () => resizes.disconnect();
  }, [block]);

  return [handleRef, place] as const;
}

function useForgetTheBlockWhenThePointerLeaves(
  store: BlockHoverStore,
  handleRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    const handle = handleRef.current;
    const area = handle && editorRootOf(handle);
    if (!handle || !area) return;
    const forget = (event: PointerEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && (area.contains(next) || handle.contains(next))) return;
      store.set(null);
    };
    area.addEventListener('pointerleave', forget);
    handle.addEventListener('pointerleave', forget);
    return () => {
      area.removeEventListener('pointerleave', forget);
      handle.removeEventListener('pointerleave', forget);
    };
  }, [store, handleRef]);
}

const handBackFocusTo = (editor: TiptapEditor, handle: HTMLElement | null) =>
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

function dropLineFor(
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

function draggedFrom(block: HoveredBlock, handle: HTMLElement): Dragged {
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

const showTheClone =
  (clone: Node): RefCallback<HTMLDivElement> =>
  (element) => {
    element?.replaceChildren(clone);
  };

function DraggableGrip({
  shown,
  handleRef,
  ref,
  ...props
}: ComponentProps<typeof EditorGlyphButton> & {
  shown: boolean;
  handleRef: RefObject<HTMLButtonElement | null>;
}) {
  const { setNodeRef, listeners } = useDraggable({ id: DRAG_ID, disabled: !shown });

  return (
    <EditorGlyphButton
      {...props}
      {...listeners}
      onMouseDown={(event) => {
        props.onMouseDown?.(event);
        listeners?.onMouseDown?.(event);
      }}
      ref={mergeRefs(ref, handleRef, setNodeRef)}
      onDragStart={(event) => event.preventDefault()}
    />
  );
}

export function EditorBlockHandle({ store }: { store: BlockHoverStore }) {
  const t = useTranslate(editorMessages);
  const { editor, editable, styles } = useEditorContext('Editor');
  const hovered = useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
  const [menuBlock, setMenuBlock] = useState<HoveredBlock | null>(null);
  const [dragged, setDragged] = useState<Dragged | null>(null);
  const [line, setLine] = useState<DropLine | null>(null);
  const grabbedRef = useRef<HoveredBlock | null>(null);
  const draggedRef = useRef<Dragged | null>(null);
  const lineRef = useRef<DropLine | null>(null);
  const block = menuBlock ?? dragged?.block ?? hovered;
  const [handleRef, place] = useBesideTheFirstLine(block);
  const node = block && editor?.state.doc.nodeAt(block.pos);
  const sensors = useDragSensors({ touch: false });

  useForgetTheBlockWhenThePointerLeaves(store, handleRef);

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

  return (
    <DndContext
      sensors={sensors}
      accessibility={SILENT}
      onDragStart={() => {
        const handle = handleRef.current;
        const grabbed = grabbedRef.current;
        if (!editor || !grabbed || !handle) return;
        const next = draggedFrom(grabbed, handle);
        draggedRef.current = next;
        setDragged(next);
        markTheDraggedBlock(editor.view, grabbed.pos);
      }}
      onDragMove={followThePointer}
      onDragEnd={() => {
        const from = draggedRef.current?.block.pos;
        const to = lineRef.current?.pos;
        endTheDrag();
        swallowTheClickThatEndsADrag();
        if (editor && from !== undefined && to !== undefined) moveBlock(editor, from, to);
      }}
      onDragCancel={endTheDrag}
    >
      <Menu
        open={menuBlock !== null}
        onOpenChange={(open) => {
          if (open && editor && block && node) {
            if (isATable(node)) keepTheCaretInTheTable(editor, block.pos, node);
            else selectBlock(editor, block.pos);
          }
          setMenuBlock(open ? block : null);
          if (!open && editor) handBackFocusTo(editor, handleRef.current);
        }}
      >
        <Menu.Trigger asChild>
          <DraggableGrip
            shown={shown}
            handleRef={handleRef}
            aria-label={t('editor.blockHandle')}
            tabIndex={-1}
            data-hidden={shown ? undefined : ''}
            data-editor-block-handle=""
            className={styles.blockHandle()}
            style={place}
            onMouseDown={() => {
              grabbedRef.current = block;
            }}
          >
            <GripVertical aria-hidden="true" />
          </DraggableGrip>
        </Menu.Trigger>
        <Menu.Content side="bottom" align="start">
          <Menu.Item onSelect={run(insertBlockBelow)}>
            <PlusIcon aria-hidden="true" />
            {t('editor.blockInsertBelow')}
          </Menu.Item>
          {turnInto.length > 0 && (
            <Menu>
              <Menu.Trigger>
                <ArrowPathIcon aria-hidden="true" />
                {t('editor.blockTurnInto')}
              </Menu.Trigger>
              <Menu.Content>
                {turnInto
                  .filter((option) => option.holdsText)
                  .map((option) => (
                    <Menu.Item
                      key={option.id}
                      onSelect={run((instance, pos, current) =>
                        turnBlockInto(instance, option, pos, current),
                      )}
                    >
                      {option.icon}
                      {option.label(t)}
                    </Menu.Item>
                  ))}
              </Menu.Content>
            </Menu>
          )}
          <Menu.Item onSelect={run(duplicateBlock)}>
            <DocumentDuplicateIcon aria-hidden="true" />
            {t('editor.blockDuplicate')}
          </Menu.Item>
          {node && isATable(node) && (
            <>
              <Menu.Separator />
              <EditorTableMenuItems deletesTheTable={false} />
            </>
          )}
          <Menu.Separator />
          <Menu.Item onSelect={run(deleteBlock)} className={styles.destructiveItem()}>
            <TrashIcon aria-hidden="true" />
            {t('common.remove')}
          </Menu.Item>
        </Menu.Content>
      </Menu>
      {line && (
        <span
          aria-hidden="true"
          data-editor-drop-line=""
          className={styles.dropLine()}
          style={line.style}
        />
      )}
      <DragOverlay dropAnimation={null}>
        {dragged && (
          <div className={styles.dragPreview()} style={dragged.box}>
            <div
              ref={showTheClone(dragged.clone)}
              className={styles.content({ className: cn('min-h-0 p-0') })}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
