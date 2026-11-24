'use client';

import { useState, type Ref, type SyntheticEvent } from 'react';

import { useDndMonitor, useDraggable } from '@dnd-kit/core';

import { mergeRefs } from '../../../../utils';
import {
  isTheSelection,
  plainPressAt,
  pressesOnSomethingElse,
  SELECTION,
} from '../lib/selection-press';

import type {
  SchedulerPoint,
  SchedulerSelectableProps,
  SchedulerSelection,
  SchedulerSelectionStart,
} from '../parts/selectable';

type Pressed<T> = SchedulerSelectionStart<T> & { start: SchedulerPoint };

type SelectionOptions<T> = Pick<SchedulerSelectableProps<T>, 'startAt' | 'onSelect'> & {
  ref: Ref<HTMLDivElement> | undefined;
};

export function useInternalSchedulerSelection<T>({ ref, startAt, onSelect }: SelectionOptions<T>) {
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

  return { nodeRef: mergeRefs(draggable.setNodeRef, ref), listeners, selection };
}
