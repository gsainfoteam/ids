'use client';

import {
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';

import { useDndMonitor, useDraggable, type Active } from '@dnd-kit/core';

import { mergeRefs } from '../../../utils';

export type SchedulerPoint = { x: number; y: number };

export type SchedulerSelection<T> = { from: T; to: T };

export type SchedulerSelectionStart<T> = { from: T; at: (point: SchedulerPoint) => T };

type Pressed<T> = SchedulerSelectionStart<T> & { start: SchedulerPoint };

export type SchedulerSelectableProps<T> = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> & {
  ref?: Ref<HTMLDivElement>;
  startAt: (target: Element, point: SchedulerPoint) => SchedulerSelectionStart<T> | null;
  onSelect: ((selection: SchedulerSelection<T>) => void) | undefined;
  children: (selection: SchedulerSelection<T> | null) => ReactNode;
};

const SELECTION = 'scheduler-selection';

const isTheSelection = (active: Active) => active.id === SELECTION;

const pressesOnSomethingElse = (target: Element) =>
  target.closest('[data-scheduler-slot], button, a, input') !== null;

const holdsAModifier = (event: MouseEvent | TouchEvent) =>
  event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;

function plainPressAt(event: SyntheticEvent): SchedulerPoint | null {
  const native = event.nativeEvent as MouseEvent | TouchEvent;
  if (holdsAModifier(native)) return null;
  if ('touches' in native) {
    const [touch] = native.touches;
    return native.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return native.button === 0 ? { x: native.clientX, y: native.clientY } : null;
}

export function SchedulerSelectable<T>({
  ref,
  startAt,
  onSelect,
  children,
  ...props
}: SchedulerSelectableProps<T>) {
  const [pressed, setPressed] = useState<Pressed<T> | null>(null);
  const [selection, setSelection] = useState<SchedulerSelection<T> | null>(null);
  const draggable = useDraggable({ id: SELECTION, disabled: !onSelect });

  const selectionAfter = (delta: SchedulerPoint) => {
    if (!pressed) return null;
    const { start } = pressed;
    return { from: pressed.from, to: pressed.at({ x: start.x + delta.x, y: start.y + delta.y }) };
  };

  const end = () => {
    setPressed(null);
    setSelection(null);
  };

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (isTheSelection(active)) setSelection(selectionAfter({ x: 0, y: 0 }));
    },
    onDragMove: ({ active, delta }) => {
      if (isTheSelection(active)) setSelection(selectionAfter(delta));
    },
    onDragEnd: ({ active, delta }) => {
      if (!isTheSelection(active)) return;
      const selected = selectionAfter(delta);
      end();
      if (selected) onSelect?.(selected);
    },
    onDragCancel: ({ active }) => {
      if (isTheSelection(active)) end();
    },
  });

  const listeners = Object.fromEntries(
    Object.entries(draggable.listeners ?? {}).map(([name, listener]) => [
      name,
      (event: SyntheticEvent) => {
        const point = plainPressAt(event);
        if (!point || !(event.target instanceof Element)) return;
        if (pressesOnSomethingElse(event.target)) return;
        const started = startAt(event.target, point);
        if (!started) return;
        setPressed({ ...started, start: point });
        listener(event);
      },
    ]),
  );

  return (
    <div ref={mergeRefs(draggable.setNodeRef, ref)} {...props} {...listeners}>
      {children(selection)}
    </div>
  );
}
