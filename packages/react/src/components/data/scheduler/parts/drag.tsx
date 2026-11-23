'use client';

import type { ReactNode, RefObject } from 'react';

import { DndContext, type AutoScrollOptions } from '@dnd-kit/core';

import { SchedulerDragContext, type SchedulerDragPiece } from '../context';
import { useInternalSchedulerDrag } from '../hooks/use-scheduler-drag';

import type { SchedulerDragMeasure } from '../lib/drag-geometry';
import type { SchedulerFormat } from '../lib/format';
import type { SchedulerEventChange, SchedulerEventData } from '../lib/layout';

export type SchedulerDragProps<P extends SchedulerDragPiece> = {
  events: readonly SchedulerEventData[];
  format: SchedulerFormat;
  hourHeight: number | undefined;
  bodyRef: RefObject<HTMLElement | null>;
  measure: (piece: P, element: HTMLElement) => SchedulerDragMeasure | null;
  hint: string;
  autoScroll?: AutoScrollOptions;
  onEventChange: ((event: SchedulerEventData, change: SchedulerEventChange) => void) | undefined;
  children: ReactNode;
};

export function SchedulerDrag<P extends SchedulerDragPiece>({
  hint,
  autoScroll,
  children,
  ...options
}: SchedulerDragProps<P>) {
  const {
    value,
    sensors,
    snapToTheGrid,
    announcements,
    announcement,
    onDragStart,
    onDragEnd,
    onDragCancel,
  } = useInternalSchedulerDrag(options);

  return (
    <SchedulerDragContext value={value}>
      <DndContext
        sensors={sensors}
        modifiers={[snapToTheGrid]}
        autoScroll={autoScroll}
        accessibility={{ announcements, screenReaderInstructions: { draggable: hint } }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        {children}
      </DndContext>
      <span aria-live="assertive" className="sr-only">
        {announcement}
      </span>
    </SchedulerDragContext>
  );
}
