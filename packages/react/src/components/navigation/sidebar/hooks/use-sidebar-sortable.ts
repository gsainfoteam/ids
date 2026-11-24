'use client';

import { useId, useRef, useState, type ReactNode } from 'react';

import { getEventCoordinates } from '@dnd-kit/utilities';
import { clamp, minBy } from 'es-toolkit';

import { useInternalSidebarMovedItemReveal } from './use-sidebar-moved-item-reveal';
import { useInternalDragSensors } from '../../../../internal/lib/drag-sensors';
import { swallowTheClickThatEndsADrag } from '../../../../internal/lib/drag-surface';
import { useInternalTranslate } from '../../../../internal/translate';
import { ITEM_SELECTOR, sameDrop, type PendingMove } from '../lib/sortable-drop';
import {
  describeMove,
  drawnDrop,
  dropPositionAt,
  isInside,
  keyboardStops,
  moveForDrop,
  siblingKeysOf,
  type SidebarDescribedMove,
  type SidebarDrop,
  type SidebarKeyboardStop,
  type SidebarMove,
  type SidebarTree,
  type SidebarTreeItem,
  type SidebarTreeMove,
} from '../lib/tree';

import type { SidebarFrame, SidebarSortableValue } from '../context';
import type {
  Announcements,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';

const REACH_BEYOND_THE_ROWS = 36;
const SAME_HEIGHT = 2;
const LINE_INSET = 4;
const LINE_DOT_RADIUS = 3;

export type SidebarLine = {
  position: 'before' | 'after';
  top: number;
  left: number;
  width: number;
};

type Grab = { key: string; stops: SidebarKeyboardStop[]; at: number };

type SidebarSortableOptions<T extends SidebarTreeItem<T>> = {
  items: readonly T[];
  tree: SidebarTree<T>;
  onItemsChange: (items: T[], move: SidebarMove<T>) => void;
  canMove?: (move: SidebarMove<T>) => boolean;
};

export function useInternalSidebarSortable<T extends SidebarTreeItem<T>>({
  items,
  tree,
  onItemsChange,
  canMove,
}: SidebarSortableOptions<T>) {
  const t = useInternalTranslate();
  const hintId = useId();
  const frames = useRef(new Map<string, SidebarFrame>());
  const pending = useRef<PendingMove | null>(null);
  const dropRef = useRef<SidebarDrop | null>(null);
  const [drop, setDrop] = useState<SidebarDrop | null>(null);
  const [line, setLine] = useState<SidebarLine | null>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ key: string; preview: ReactNode } | null>(null);
  const [grab, setGrab] = useState<Grab | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const described = useRef<{ tree: SidebarTree<T>; moves: Map<string, SidebarDescribedMove<T>> }>(
    null,
  );

  const sensors = useInternalDragSensors();
  const revealed = useInternalSidebarMovedItemReveal({
    items,
    tree,
    pendingRef: pending,
    framesRef: frames,
  });

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

  const lineFor = ({ key, position }: SidebarDrop): SidebarLine | null => {
    const row = frames.current.get(key)?.element.closest('li');
    const box = layer.current?.getBoundingClientRect();
    if (position === 'inside' || !row || !box) return null;

    const rect = row.getBoundingClientRect();
    const neighbour = position === 'before' ? row.previousElementSibling : row.nextElementSibling;
    const edge = position === 'before' ? rect.top : rect.bottom;
    const across = neighbour?.getBoundingClientRect()[position === 'before' ? 'bottom' : 'top'];
    const middle = across === undefined ? edge : (edge + across) / 2;
    return {
      position,
      top: clamp(middle - box.top, LINE_DOT_RADIUS, box.height - LINE_DOT_RADIUS),
      left: rect.left - box.left + LINE_INSET,
      width: rect.width - LINE_INSET * 2,
    };
  };

  const showDrop = (next: SidebarDrop | null) => {
    const drawn = next && drawnDrop(tree, next, isVisible);
    dropRef.current = drawn;
    setDrop((previous) => (sameDrop(previous, drawn) ? previous : drawn));
    setLine(drawn && lineFor(drawn));
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

  const rowOf = (key: string) => frames.current.get(key)?.element;

  const lineRectOf = ({ key, position }: SidebarDrop) => {
    const row = rowOf(key);
    if (!row) return null;
    return (position === 'inside' ? row : (row.closest('li') ?? row)).getBoundingClientRect();
  };

  const lineYOf = (drop: SidebarDrop) => {
    const rect = lineRectOf(drop);
    if (!rect) return Infinity;
    if (drop.position === 'before') return rect.top;
    if (drop.position === 'after') return rect.bottom;
    return (rect.top + rect.bottom) / 2;
  };

  const lineXOf = (drop: SidebarDrop) => lineRectOf(drop)?.left ?? Infinity;

  const isOpenFor = (dragged: string, drop: SidebarDrop) => {
    const move = moveForDrop(tree, dragged, drop);
    return move === null || isAllowed(move);
  };

  const isNearTheRows = ({ x, y }: { x: number; y: number }) => {
    const rects = [...frames.current.values()]
      .filter((frame) => !frame.folded)
      .map((frame) => frame.element.getBoundingClientRect());
    if (rects.length === 0) return false;
    const left = Math.min(...rects.map((rect) => rect.left));
    const right = Math.max(...rects.map((rect) => rect.right));
    const top = Math.min(...rects.map((rect) => rect.top)) - REACH_BEYOND_THE_ROWS;
    const bottom = Math.max(...rects.map((rect) => rect.bottom)) + REACH_BEYOND_THE_ROWS;
    return x >= left && x <= right && y >= top && y <= bottom;
  };

  const nearestAllowedDrop = (dragged: string, pointerY: number, previewLeft: number) => {
    const stops = keyboardStops(tree, dragged, isVisible, isAllowed);
    const distance = (stop: SidebarKeyboardStop) => Math.abs(lineYOf(stop.drop) - pointerY);
    const closest = minBy(stops, distance);
    if (!closest) return null;
    const level = distance(closest) + SAME_HEIGHT;
    const nearest = minBy(
      stops.filter((stop) => distance(stop) <= level),
      (stop) => Math.abs(lineXOf(stop.drop) - previewLeft),
    );
    return nearest?.move ? nearest.drop : null;
  };

  const dropsAtTheSameLine = (drop: SidebarDrop): SidebarDrop[] => {
    const node = tree.nodes.get(drop.key);
    if (!node || drop.position === 'inside') return [drop];

    const drops: SidebarDrop[] = [];
    if (drop.position === 'after')
      for (let outer: typeof node | undefined = node; outer;) {
        drops.push({ key: outer.key, position: 'after' });
        if (outer.parent === null || siblingKeysOf(tree, outer.parent).at(-1) !== outer.key) break;
        outer = tree.nodes.get(outer.parent);
      }
    else {
      drops.push(drop);
      let inner = siblingKeysOf(tree, node.parent)[node.index - 1];
      for (; inner !== undefined;) {
        const last = tree.nodes.get(inner)?.children.filter(isVisible).at(-1);
        if (last === undefined) break;
        drops.push({ key: last, position: 'after' });
        inner = last;
      }
    }
    return drops;
  };

  const depthUnderThePreview = (dragged: string, drop: SidebarDrop, previewLeft: number) =>
    minBy(
      dropsAtTheSameLine(drop).filter((candidate) => isOpenFor(dragged, candidate)),
      (candidate) => Math.abs(lineXOf(candidate) - previewLeft),
    ) ?? drop;

  const followPointer = ({ active, over, activatorEvent, delta }: DragMoveEvent) => {
    const start = getEventCoordinates(activatorEvent);
    if (!start) return showDrop(null);
    const dragged = String(active.id);
    const pointer = { x: start.x + delta.x, y: start.y + delta.y };
    const previewLeft = active.rect.current.translated?.left ?? pointer.x;
    const target = over && String(over.id);

    if (!over || !target)
      return showDrop(
        isNearTheRows(pointer) ? nearestAllowedDrop(dragged, pointer.y, previewLeft) : null,
      );
    if (target === dragged || isInside(tree, target, dragged)) return showDrop(null);

    const childrenShown = (tree.nodes.get(target)?.children ?? []).some(isVisible);
    const ratio = (pointer.y - over.rect.top) / over.rect.height;
    const zone: SidebarDrop = {
      key: target,
      position: dropPositionAt(
        ratio,
        isOpenFor(dragged, { key: target, position: 'inside' }),
        childrenShown,
      ),
    };
    const drop = depthUnderThePreview(dragged, zone, previewLeft);
    const move = moveForDrop(tree, dragged, drop);
    if (!move) return showDrop(null);
    showDrop(isAllowed(move) ? drop : nearestAllowedDrop(dragged, pointer.y, previewLeft));
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => t('common.drag.start', { item: labelOf(active.id) }),
    onDragOver: () => undefined,
    onDragEnd: ({ active, over }) =>
      t(over ? 'common.drag.end' : 'common.drag.cancel', { item: labelOf(active.id) }),
    onDragCancel: ({ active }) => t('common.drag.cancel', { item: labelOf(active.id) }),
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
      setAnnouncement(t('common.drag.start', { item: labelOf(key) }));
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
      endGrab(t(move ? 'common.drag.end' : 'common.drag.cancel', { item: label }));
      if (move) commit(move, true);
    },
    cancel: () => {
      if (grab) endGrab(t('common.drag.cancel', { item: labelOf(grab.key) }));
    },
  };

  const startPointerDrag = ({ active }: DragStartEvent) => {
    const key = String(active.id);
    pending.current = null;
    value.cancel();
    setDragging({ key, preview: frames.current.get(key)?.preview });
  };

  const dropAtThePointer = ({ active }: DragEndEvent) => {
    const move = dropRef.current && moveForDrop(tree, String(active.id), dropRef.current);
    endPointerDrag();
    swallowTheClickThatEndsADrag();
    if (move) commit(move, false);
  };

  return {
    value,
    sensors,
    announcements,
    layerRef: layer,
    line,
    dragging,
    announcement,
    hintId,
    startPointerDrag,
    followPointer,
    dropAtThePointer,
    endPointerDrag,
  };
}
