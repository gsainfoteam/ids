'use client';

import { use, type ReactNode } from 'react';

import { DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core';

import { useInternalTranslate } from '../../../../internal/translate';
import { Item } from '../../../data/item';
import {
  SidebarSortableContext,
  useInternalSidebarContext,
  type SidebarSortableValue,
} from '../context';
import { useInternalSidebarDragFrame } from '../hooks/use-sidebar-drag-frame';
import { useInternalSidebarSortable } from '../hooks/use-sidebar-sortable';
import { rowAtThePointerHeight } from '../lib/sortable-drop';

import type { SidebarMove, SidebarTree, SidebarTreeItem } from '../lib/tree';

export type SidebarSortableProps<T extends SidebarTreeItem<T>> = {
  items: readonly T[];
  tree: SidebarTree<T>;
  onItemsChange: (items: T[], move: SidebarMove<T>) => void;
  canMove?: (move: SidebarMove<T>) => boolean;
  children?: ReactNode;
};

export function SidebarSortable<T extends SidebarTreeItem<T>>({
  items,
  tree,
  onItemsChange,
  canMove,
  children,
}: SidebarSortableProps<T>) {
  const { styles } = useInternalSidebarContext('Sidebar.Group.Tree');
  const t = useInternalTranslate();
  const {
    value,
    sensors,
    announcements,
    layerRef,
    line,
    dragging,
    announcement,
    hintId,
    startPointerDrag,
    followPointer,
    dropAtThePointer,
    endPointerDrag,
  } = useInternalSidebarSortable({ items, tree, onItemsChange, canMove });

  return (
    <SidebarSortableContext value={value}>
      <DndContext
        sensors={sensors}
        collisionDetection={rowAtThePointerHeight}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        accessibility={{
          announcements,
          screenReaderInstructions: { draggable: t('sidebar.drag.hint') },
        }}
        onDragStart={startPointerDrag}
        onDragMove={followPointer}
        onDragOver={followPointer}
        onDragEnd={dropAtThePointer}
        onDragCancel={endPointerDrag}
      >
        <div ref={layerRef} className={styles.dropLayer()}>
          {children}
          {line && (
            <span
              aria-hidden
              data-position={line.position}
              className={styles.dropLine()}
              style={{ top: line.top, left: line.left, width: line.width }}
            />
          )}
        </div>
        <span id={hintId} hidden>
          {t('sidebar.drag.hint')}
        </span>
        <span aria-live="assertive" className="sr-only">
          {announcement}
        </span>
        <DragOverlay dropAnimation={null} zIndex={0}>
          {dragging && (
            <Item
              size="tiny"
              variant="outline"
              className={styles.item({ className: styles.dragPreview() })}
            >
              {dragging.preview}
            </Item>
          )}
        </DragOverlay>
      </DndContext>
    </SidebarSortableContext>
  );
}

function SortableFrame({
  dragKey,
  sortable,
  preview,
  children,
}: {
  dragKey: string;
  sortable: SidebarSortableValue;
  preview: ReactNode;
  children: ReactNode;
}) {
  const { styles } = useInternalSidebarContext('Sidebar.Item');
  const { ref, listeners, drop, dragging, onKeyDownCapture, onBlur } = useInternalSidebarDragFrame({
    dragKey,
    sortable,
    preview,
  });

  return (
    <div
      ref={ref}
      {...listeners}
      data-drop={drop}
      data-dragging={dragging ? '' : undefined}
      className={styles.dragFrame()}
      onDragStart={(event) => event.preventDefault()}
      onKeyDownCapture={onKeyDownCapture}
      onBlur={onBlur}
    >
      {children}
    </div>
  );
}

export function SidebarDragFrame({
  dragKey,
  preview,
  children,
}: {
  dragKey: string | undefined;
  preview: ReactNode;
  children: ReactNode;
}) {
  const sortable = use(SidebarSortableContext);
  const { rail } = useInternalSidebarContext('Sidebar.Item');
  if (!sortable || dragKey === undefined || rail) return children;

  return (
    <SortableFrame dragKey={dragKey} sortable={sortable} preview={preview}>
      {children}
    </SortableFrame>
  );
}
