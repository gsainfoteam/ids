'use client';

import { type ComponentProps, type RefCallback, type RefObject } from 'react';

import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core';
import {
  ArrowPathIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/16/solid';
import { GripVertical } from 'lucide-react';

import { deleteBlock, duplicateBlock, insertBlockBelow, turnBlockInto } from './commands';
import { isATable } from './geometry';
import { useInternalTranslate } from '../../../../internal/translate';
import { cn, mergeRefs } from '../../../../utils';
import { Menu } from '../../../overlay/menu';
import { useInternalEditorContext } from '../context';
import { useInternalEditorBlockHandle } from '../hooks/use-editor-block-handle';
import { editorMessages } from '../messages-catalog';
import { EditorGlyphButton } from '../parts/glyph-button';
import { EditorTableMenuItems } from '../table/edit-menu';

import type { BlockHoverStore } from './store';

const DRAG_ID = 'ids-editor-block';
const SILENT = {
  announcements: {
    onDragStart: () => undefined,
    onDragOver: () => undefined,
    onDragEnd: () => undefined,
    onDragCancel: () => undefined,
  },
  screenReaderInstructions: { draggable: '' },
};

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
  const t = useInternalTranslate(editorMessages);
  const { editor, editable, styles } = useInternalEditorContext('Editor');
  const {
    sensors,
    handleRef,
    place,
    node,
    shown,
    turnInto,
    menuOpen,
    dragged,
    line,
    run,
    followThePointer,
    startTheDrag,
    dropTheBlock,
    endTheDrag,
    onMenuOpenChange,
    grab,
  } = useInternalEditorBlockHandle(store, editor, editable);

  return (
    <DndContext
      sensors={sensors}
      accessibility={SILENT}
      onDragStart={startTheDrag}
      onDragMove={followThePointer}
      onDragEnd={dropTheBlock}
      onDragCancel={endTheDrag}
    >
      <Menu open={menuOpen} onOpenChange={onMenuOpenChange}>
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
            onMouseDown={grab}
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
