'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type DragEvent,
  type RefObject,
} from 'react';

import {
  ArrowPathIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/16/solid';
import { GripVertical } from 'lucide-react';

import {
  deleteBlock,
  duplicateBlock,
  insertBlockBelow,
  selectBlock,
  startDraggingBlock,
  turnBlockInto,
} from './commands';
import { useTranslate } from '../../../../internal/translate';
import { Menu } from '../../../overlay/menu';
import { blocksAvailableIn, turnsIntoOtherBlocks } from '../blocks/catalog';
import { useEditorContext } from '../context';
import { EditorGlyphButton } from '../glyph-button';

import type { BlockHoverStore, HoveredBlock } from './store';
import type { Editor as TiptapEditor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

type BlockAction = (editor: TiptapEditor, pos: number, node: ProseMirrorNode) => void;

const FIRST_LINE = 'p,h1,h2,h3,h4,h5,h6,pre,[data-type=detailsSummary]';

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

function useTopBesideTheFirstLine(block: HoveredBlock | null) {
  const handleRef = useRef<HTMLButtonElement>(null);
  const [top, setTop] = useState(0);

  useLayoutEffect(() => {
    const handle = handleRef.current;
    const origin = handle?.offsetParent;
    if (!block || !handle || !origin) return;
    const line = firstLineOf(block.dom);
    setTop(line.top - origin.getBoundingClientRect().top + (line.height - handle.offsetHeight) / 2);
  }, [block]);

  return [handleRef, top] as const;
}

function useForgetTheBlockWhenThePointerLeaves(
  store: BlockHoverStore,
  handleRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    const area = handleRef.current?.parentElement;
    if (!area) return;
    const forget = () => store.set(null);
    area.addEventListener('pointerleave', forget);
    return () => area.removeEventListener('pointerleave', forget);
  }, [store, handleRef]);
}

const handBackFocusTo = (editor: TiptapEditor, handle: HTMLElement | null) =>
  queueMicrotask(() => {
    const focused = handle?.ownerDocument.activeElement;
    if (!editor.isDestroyed && (focused === handle || focused === handle?.ownerDocument.body))
      editor.commands.focus();
  });

export function EditorBlockHandle({ store }: { store: BlockHoverStore }) {
  const t = useTranslate();
  const { editor, editable, styles } = useEditorContext('Editor');
  const hovered = useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
  const [menuBlock, setMenuBlock] = useState<HoveredBlock | null>(null);
  const block = menuBlock ?? hovered;
  const [handleRef, top] = useTopBesideTheFirstLine(block);
  const node = block && editor?.state.doc.nodeAt(block.pos);

  useForgetTheBlockWhenThePointerLeaves(store, handleRef);

  const shown = editable && editor !== null && node != null && block !== null;
  const turnInto = shown && turnsIntoOtherBlocks(node) ? blocksAvailableIn(editor) : [];

  const run = (action: BlockAction) => () => {
    if (!editor || !block || !node) return;
    editor.view.focus();
    action(editor, block.pos, node);
  };

  const drag = (event: DragEvent<HTMLButtonElement>) => {
    if (editor && block) startDraggingBlock(editor, block.pos, event.nativeEvent);
  };

  return (
    <Menu
      open={menuBlock !== null}
      onOpenChange={(open) => {
        if (open && editor && block) selectBlock(editor, block.pos);
        setMenuBlock(open ? block : null);
        if (!open && editor) handBackFocusTo(editor, handleRef.current);
      }}
    >
      <Menu.Trigger asChild>
        <EditorGlyphButton
          ref={handleRef}
          aria-label={t('editor.blockHandle')}
          tabIndex={-1}
          draggable={shown}
          data-hidden={shown ? undefined : ''}
          data-editor-block-handle=""
          className={styles.blockHandle()}
          style={{ top }}
          onDragStart={drag}
        >
          <GripVertical aria-hidden="true" />
        </EditorGlyphButton>
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
        <Menu.Separator />
        <Menu.Item onSelect={run(deleteBlock)}>
          <TrashIcon aria-hidden="true" />
          {t('editor.blockDelete')}
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
