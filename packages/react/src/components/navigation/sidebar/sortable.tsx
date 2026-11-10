'use client';

import { use, useEffect, useId, useRef, useState, type ReactNode, type RefCallback } from 'react';

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
import { minBy } from 'es-toolkit';

import {
  SidebarFoldedContext,
  SidebarSortableContext,
  useSidebarContext,
  type SidebarFrame,
  type SidebarSortableValue,
} from './context';
import {
  describeMove,
  dropPositionAt,
  isInside,
  keyboardStops,
  moveForDrop,
  type SidebarDescribedMove,
  type SidebarDrop,
  type SidebarKeyboardStop,
  type SidebarMove,
  type SidebarTree,
  type SidebarTreeItem,
  type SidebarTreeMove,
} from './tree';
import { keyHandler } from '../../../internal/keys';
import { useTranslate } from '../../../internal/translate';
import { mergeRefs } from '../../../utils';
import { Item } from '../../data/item';

const ITEM_SELECTOR = '[data-sidebar-item]';
const POINTER_TRAVEL_BEFORE_DRAG = 4;
const TOUCH_HOLD_BEFORE_DRAG = 250;
const TOUCH_TRAVEL_ALLOWED_WHILE_HOLDING = 5;
const SPACE = ' ';

const sameDrop = (a: SidebarDrop | null, b: SidebarDrop | null) =>
  a?.key === b?.key && a?.position === b?.position;

function swallowTheClickThatEndsADrag() {
  const swallow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  window.addEventListener('click', swallow, { capture: true, once: true });
  setTimeout(() => window.removeEventListener('click', swallow, { capture: true }));
}

function swallowTheSpaceKeyupThatWouldPressTheRow() {
  const swallow = (event: KeyboardEvent) => {
    if (event.key !== SPACE) return;
    event.preventDefault();
    window.removeEventListener('keyup', swallow, { capture: true });
  };
  window.addEventListener('keyup', swallow, { capture: true });
}

type Grab = { key: string; stops: SidebarKeyboardStop[]; at: number };

type PendingMove = { key: string; items: readonly unknown[]; focus: boolean };

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
  const { styles } = useSidebarContext('Sidebar.Group');
  const t = useTranslate();
  const hintId = useId();
  const frames = useRef(new Map<string, SidebarFrame>());
  const pending = useRef<PendingMove | null>(null);
  const dropRef = useRef<SidebarDrop | null>(null);
  const [drop, setDrop] = useState<SidebarDrop | null>(null);
  const [dragging, setDragging] = useState<{ key: string; preview: ReactNode } | null>(null);
  const [grab, setGrab] = useState<Grab | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [revealed, setRevealed] = useState<SidebarSortableValue['revealed']>(null);
  const described = useRef<{ tree: SidebarTree<T>; moves: Map<string, SidebarDescribedMove<T>> }>(
    null,
  );

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
    const move = pending.current;
    if (!move || move.items === items) return;
    pending.current = null;

    const ancestors: string[] = [];
    for (let node = tree.nodes.get(move.key); node?.parent; node = tree.nodes.get(node.parent))
      ancestors.push(node.parent);
    setRevealed((previous) => ({ ancestors, times: (previous?.times ?? 0) + 1 }));

    if (!move.focus) return;
    const focusTheMovedItem = () =>
      frames.current.get(move.key)?.element.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus();
    focusTheMovedItem();
    const frame = requestAnimationFrame(focusTheMovedItem);
    return () => cancelAnimationFrame(frame);
  }, [items, tree]);

  const describe = (move: SidebarTreeMove) => {
    if (described.current?.tree !== tree) described.current = { tree, moves: new Map() };
    const { moves } = described.current;
    const id = `${move.key}>${move.parent}|${move.index}`;
    const known = moves.get(id);
    if (known) return known;
    const next = describeMove(items, tree, move);
    moves.set(id, next);
    return next;
  };

  const isAllowed = (move: SidebarTreeMove) => !canMove || canMove(describe(move).move);

  const isVisible = (key: string) => {
    const frame = frames.current.get(key);
    return frame !== undefined && !frame.folded;
  };

  const showDrop = (next: SidebarDrop | null) => {
    dropRef.current = next;
    setDrop((previous) => (sameDrop(previous, next) ? previous : next));
  };

  const commit = (move: SidebarTreeMove, focus: boolean) => {
    const { items: next, move: publicMove, key } = describe(move);
    pending.current = { key, items, focus };
    onItemsChange(next, publicMove);
  };

  const labelOf = (key: UniqueIdentifier) =>
    frames.current.get(String(key))?.element.querySelector(ITEM_SELECTOR)?.textContent ?? '';

  const placeLabel = (stop: SidebarKeyboardStop) =>
    stop.move
      ? t(`sidebar.drag.${stop.drop.position}`, { target: labelOf(stop.drop.key) })
      : t('sidebar.drag.origin');

  const endPointerDrag = () => {
    showDrop(null);
    setDragging(null);
  };

  const endGrab = (message: string) => {
    showDrop(null);
    setGrab(null);
    setAnnouncement(message);
  };

  const followPointer = ({ active, over, activatorEvent, delta }: DragMoveEvent) => {
    const start = getEventCoordinates(activatorEvent);
    const dragged = String(active.id);
    const target = over && String(over.id);
    if (!start || !over || !target || target === dragged || isInside(tree, target, dragged))
      return showDrop(null);

    const into = moveForDrop(tree, dragged, { key: target, position: 'inside' });
    const canDropInside = into === null || isAllowed(into);
    const hasChildren = (tree.nodes.get(target)?.children.length ?? 0) > 0;
    const ratio = (start.y + delta.y - over.rect.top) / over.rect.height;
    const next: SidebarDrop = {
      key: target,
      position: dropPositionAt(ratio, canDropInside, hasChildren),
    };
    const move = moveForDrop(tree, dragged, next);
    if (!move) return showDrop(null);
    showDrop(isAllowed(move) ? next : nearestAllowedDrop(dragged, start.y + delta.y));
  };

  const lineYOf = ({ drop }: SidebarKeyboardStop) => {
    const element = frames.current.get(drop.key)?.element;
    if (!element) return Infinity;
    if (drop.position === 'inside') {
      const { top, bottom } = element.getBoundingClientRect();
      return (top + bottom) / 2;
    }
    const { top, bottom } = (element.closest('li') ?? element).getBoundingClientRect();
    return drop.position === 'before' ? top : bottom;
  };

  const nearestAllowedDrop = (dragged: string, pointerY: number) => {
    const nearest = minBy(keyboardStops(tree, dragged, isVisible, isAllowed), (stop) =>
      Math.abs(lineYOf(stop) - pointerY),
    );
    return nearest?.move ? nearest.drop : null;
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => t('sidebar.drag.start', { item: labelOf(active.id) }),
    onDragOver: () => undefined,
    onDragEnd: ({ active, over }) =>
      t(over ? 'sidebar.drag.end' : 'sidebar.drag.cancel', { item: labelOf(active.id) }),
    onDragCancel: ({ active }) => t('sidebar.drag.cancel', { item: labelOf(active.id) }),
  };

  const value: SidebarSortableValue = {
    drop,
    grabbed: grab?.key ?? null,
    revealed,
    hintId,
    register: (key, frame) => {
      frames.current.set(key, frame);
      return () => {
        if (frames.current.get(key) === frame) frames.current.delete(key);
      };
    },
    grab: (key) => {
      const stops = keyboardStops(tree, key, isVisible, isAllowed);
      pending.current = null;
      setGrab({ key, stops, at: stops.findIndex((stop) => stop.move === null) });
      setAnnouncement(t('sidebar.drag.start', { item: labelOf(key) }));
    },
    step: (direction) => {
      if (!grab) return;
      const at = Math.min(Math.max(grab.at + direction, 0), grab.stops.length - 1);
      const stop = grab.stops[at];
      if (!stop) return;
      setGrab({ ...grab, at });
      showDrop(stop.move ? stop.drop : null);
      setAnnouncement(placeLabel(stop));
    },
    release: () => {
      const move = grab?.stops[grab.at]?.move;
      const label = labelOf(grab?.key ?? '');
      endGrab(t(move ? 'sidebar.drag.end' : 'sidebar.drag.cancel', { item: label }));
      if (move) commit(move, true);
    },
    cancel: () => {
      if (grab) endGrab(t('sidebar.drag.cancel', { item: labelOf(grab.key) }));
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
          pending.current = null;
          value.cancel();
          setDragging({ key, preview: frames.current.get(key)?.preview });
        }}
        onDragMove={followPointer}
        onDragOver={followPointer}
        onDragEnd={({ active }) => {
          const move = dropRef.current && moveForDrop(tree, String(active.id), dropRef.current);
          endPointerDrag();
          swallowTheClickThatEndsADrag();
          if (move) commit(move, false);
        }}
        onDragCancel={endPointerDrag}
      >
        {children}
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
  const { styles } = useSidebarContext('Sidebar.Item');
  const folded = use(SidebarFoldedContext);
  const drag = useDraggable({ id: dragKey, disabled: folded });
  const dropZone = useDroppable({ id: dragKey, disabled: folded });
  const [element, setElement] = useState<HTMLElement | null>(null);
  const ref: RefCallback<HTMLDivElement> = mergeRefs(
    drag.setNodeRef,
    dropZone.setNodeRef,
    setElement,
  );
  const drop = sortable.drop?.key === dragKey ? sortable.drop.position : undefined;
  const grabbed = sortable.grabbed === dragKey;
  const { register } = sortable;

  useEffect(() => {
    if (element) return register(dragKey, { element, preview, folded });
  }, [register, dragKey, element, preview, folded]);

  const pressSpace = (action: () => void) => () => {
    swallowTheSpaceKeyupThatWouldPressTheRow();
    action();
  };

  return (
    <div
      ref={ref}
      {...drag.listeners}
      data-drop={drop}
      data-dragging={drag.isDragging || grabbed ? '' : undefined}
      className={styles.dragFrame()}
      onDragStart={(event) => event.preventDefault()}
      onKeyDownCapture={keyHandler<HTMLDivElement>(
        grabbed
          ? {
              ArrowUp: () => sortable.step(-1),
              ArrowDown: () => sortable.step(1),
              Enter: () => sortable.release(),
              Space: pressSpace(sortable.release),
              Escape: () => sortable.cancel(),
            }
          : { Space: pressSpace(() => sortable.grab(dragKey)) },
      )}
      onBlur={(event) => {
        if (grabbed && !event.currentTarget.contains(event.relatedTarget)) sortable.cancel();
      }}
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
  const { rail } = useSidebarContext('Sidebar.Item');
  if (!sortable || dragKey === undefined || rail) return children;

  return (
    <SortableFrame dragKey={dragKey} sortable={sortable} preview={preview}>
      {children}
    </SortableFrame>
  );
}
