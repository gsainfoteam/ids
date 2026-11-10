'use client';

import {
  use,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefCallback,
} from 'react';

import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragMoveEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';

import {
  SidebarFoldedContext,
  SidebarSortableContext,
  useSidebarContext,
  type SidebarSortableValue,
} from './context';
import {
  collectTree,
  dropPositionAt,
  isInside,
  moveForDrop,
  moveForKey,
  type SidebarDrop,
  type SidebarItemMove,
} from './tree';
import { keyHandler } from '../../../internal/keys';
import { useTranslate } from '../../../internal/translate';
import { mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Item } from '../../data/item';

type Frame = { element: HTMLElement; preview: ReactNode };

const ITEM_SELECTOR = '[data-sidebar-item]';
const POINTER_TRAVEL_BEFORE_DRAG = 4;
const TOUCH_HOLD_BEFORE_DRAG = 250;
const TOUCH_TRAVEL_ALLOWED_WHILE_HOLDING = 5;

const sameDrop = (a: SidebarDrop | null, b: SidebarDrop | null) =>
  a?.value === b?.value && a?.position === b?.position;

function swallowTheClickThatEndsADrag() {
  const swallow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  window.addEventListener('click', swallow, { capture: true, once: true });
  setTimeout(() => window.removeEventListener('click', swallow, { capture: true }));
}

export type SidebarSortableProps = {
  items: ReactNode;
  itemType: unknown;
  onItemMove: (move: SidebarItemMove) => void;
  children?: ReactNode;
};

export function SidebarSortable({ items, itemType, onItemMove, children }: SidebarSortableProps) {
  const { styles } = useSidebarContext('Sidebar.Group');
  const t = useTranslate();
  const hintId = useId();
  const { tree, everyItemHasAValue } = useMemo(
    () => collectTree(items, itemType),
    [items, itemType],
  );
  const frames = useRef(new Map<string, Frame>());
  const focusAfterMove = useRef<string | null>(null);
  const dropRef = useRef<SidebarDrop | null>(null);
  const [drop, setDrop] = useState<SidebarDrop | null>(null);
  const [dragging, setDragging] = useState<{ value: string; preview: ReactNode } | null>(null);
  const [revealed, setRevealed] = useState<SidebarSortableValue['revealed']>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: POINTER_TRAVEL_BEFORE_DRAG } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: TOUCH_HOLD_BEFORE_DRAG,
        tolerance: TOUCH_TRAVEL_ALLOWED_WHILE_HOLDING,
      },
    }),
  );

  useEffect(() => {
    if (!isDevelopment || everyItemHasAValue) return;
    console.warn(
      '[IDS] `<Sidebar.Group onItemMove>` moves items by their `value`. Give every `Sidebar.Item` in it a `value`; the ones without one cannot be dragged or dropped on.',
    );
  }, [everyItemHasAValue]);

  useEffect(() => {
    const value = focusAfterMove.current;
    if (value === null) return;
    focusAfterMove.current = null;
    const focusTheMovedItem = () =>
      frames.current.get(value)?.element.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus();
    focusTheMovedItem();
    const frame = requestAnimationFrame(focusTheMovedItem);
    return () => cancelAnimationFrame(frame);
  }, [tree]);

  const showDrop = (next: SidebarDrop | null) => {
    dropRef.current = next;
    setDrop((previous) => (sameDrop(previous, next) ? previous : next));
  };

  const commit = (move: SidebarItemMove) => {
    onItemMove(move);
    setRevealed((previous) => ({ value: move.value, times: (previous?.times ?? 0) + 1 }));
  };

  const endDrag = () => {
    showDrop(null);
    setDragging(null);
  };

  const followPointer = ({ active, over, activatorEvent, delta }: DragMoveEvent) => {
    const start = getEventCoordinates(activatorEvent);
    const dragged = String(active.id);
    const target = over && String(over.id);
    if (!start || !over || !target || target === dragged || isInside(tree, target, dragged))
      return showDrop(null);

    const ratio = (start.y + delta.y - over.rect.top) / over.rect.height;
    const hasChildren = (tree.get(target)?.children.length ?? 0) > 0;
    showDrop({ value: target, position: dropPositionAt(ratio, hasChildren) });
  };

  const labelOf = (id: UniqueIdentifier) =>
    frames.current.get(String(id))?.element.querySelector(ITEM_SELECTOR)?.textContent ?? String(id);

  const announcements: Announcements = {
    onDragStart: ({ active }) => t('sidebar.drag.start', { item: labelOf(active.id) }),
    onDragOver: () => undefined,
    onDragEnd: ({ active, over }) =>
      t(over ? 'sidebar.drag.end' : 'sidebar.drag.cancel', { item: labelOf(active.id) }),
    onDragCancel: ({ active }) => t('sidebar.drag.cancel', { item: labelOf(active.id) }),
  };

  const value: SidebarSortableValue = {
    drop,
    dragging: dragging?.value ?? null,
    revealed,
    hintId,
    register: (key, frame) => {
      frames.current.set(key, frame);
      return () => {
        if (frames.current.get(key) === frame) frames.current.delete(key);
      };
    },
    moveByKey: (key, direction) => {
      const move = moveForKey(tree, key, direction);
      if (!move) return false;
      focusAfterMove.current = key;
      commit(move);
      return true;
    },
  };

  return (
    <SidebarSortableContext value={value}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        accessibility={{
          announcements,
          screenReaderInstructions: { draggable: t('sidebar.drag.hint') },
        }}
        onDragStart={({ active }) => {
          const key = String(active.id);
          setDragging({ value: key, preview: frames.current.get(key)?.preview });
        }}
        onDragMove={followPointer}
        onDragOver={followPointer}
        onDragEnd={({ active }) => {
          const move = dropRef.current && moveForDrop(tree, String(active.id), dropRef.current);
          endDrag();
          swallowTheClickThatEndsADrag();
          if (move) commit(move);
        }}
        onDragCancel={endDrag}
      >
        {children}
        <span id={hintId} hidden>
          {t('sidebar.drag.hint')}
        </span>
        <DragOverlay dropAnimation={null}>
          {dragging && (
            <Item
              size="tiny"
              dense
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
  value,
  sortable,
  preview,
  children,
}: {
  value: string;
  sortable: SidebarSortableValue;
  preview: ReactNode;
  children: ReactNode;
}) {
  const { styles } = useSidebarContext('Sidebar.Item');
  const folded = use(SidebarFoldedContext);
  const drag = useDraggable({ id: value, disabled: folded });
  const dropZone = useDroppable({ id: value, disabled: folded });
  const [element, setElement] = useState<HTMLElement | null>(null);
  const ref: RefCallback<HTMLDivElement> = mergeRefs(
    drag.setNodeRef,
    dropZone.setNodeRef,
    setElement,
  );
  const drop = sortable.drop?.value === value ? sortable.drop.position : undefined;
  const { register } = sortable;

  useEffect(() => {
    if (element) return register(value, { element, preview });
  }, [register, value, element, preview]);

  return (
    <div
      ref={ref}
      {...drag.listeners}
      data-drop={drop}
      data-dragging={drag.isDragging ? '' : undefined}
      className={styles.dragFrame()}
      onDragStart={(event) => event.preventDefault()}
      onKeyDown={keyHandler<HTMLDivElement>({
        'Alt+ArrowUp': () => sortable.moveByKey(value, 'up'),
        'Alt+ArrowDown': () => sortable.moveByKey(value, 'down'),
        'Alt+ArrowRight': () => sortable.moveByKey(value, 'indent'),
        'Alt+ArrowLeft': () => sortable.moveByKey(value, 'outdent'),
      })}
    >
      {children}
      {(drop === 'before' || drop === 'after') && (
        <span aria-hidden data-position={drop} className={styles.dropLine()} />
      )}
    </div>
  );
}

export function SidebarDragFrame({
  value,
  preview,
  children,
}: {
  value: string | undefined;
  preview: ReactNode;
  children: ReactNode;
}) {
  const sortable = use(SidebarSortableContext);
  const { rail } = useSidebarContext('Sidebar.Item');
  if (!sortable || value === undefined || rail) return children;

  return (
    <SortableFrame value={value} sortable={sortable} preview={preview}>
      {children}
    </SortableFrame>
  );
}
