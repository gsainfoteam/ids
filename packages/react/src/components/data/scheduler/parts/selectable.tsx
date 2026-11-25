'use client';

import type { HTMLAttributes, ReactNode, Ref } from 'react';

import { useInternalSchedulerSelection } from '../hooks/use-scheduler-selection';

export type SchedulerPoint = { x: number; y: number };

export type SchedulerSelection<T> = { from: T; to: T };

export type SchedulerSelectionStart<T> = { from: T; at: (point: SchedulerPoint) => T };

export type SchedulerSelectableProps<T> = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> & {
  ref?: Ref<HTMLDivElement>;
  startAt: (target: Element, point: SchedulerPoint) => SchedulerSelectionStart<T> | null;
  onSelect: ((selection: SchedulerSelection<T>) => void) | undefined;
  children: (selection: SchedulerSelection<T> | null) => ReactNode;
};

export function SchedulerSelectable<T>({
  ref,
  startAt,
  onSelect,
  children,
  ...props
}: SchedulerSelectableProps<T>) {
  const { nodeRef, listeners, selection } = useInternalSchedulerSelection({
    ref,
    startAt,
    onSelect,
  });

  return (
    <div ref={nodeRef} {...props} {...listeners}>
      {children(selection)}
    </div>
  );
}
