'use client';

import { useState, type MouseEvent, type ReactElement, type ReactNode } from 'react';

import { parseDate, toCalendarDateTime } from '@internationalized/date';
import { clamp } from 'es-toolkit';

import { HOURS_IN_DAY, type SchedulerEventData, type SchedulerSlot } from './layout';
import { Menu } from '../../overlay/menu';

import type { SchedulerFormat } from './format';

const MINUTES_IN_DAY = HOURS_IN_DAY * 60;
const SLOT_MINUTES = 30;

type Target<E extends SchedulerEventData> = { event: E } | { slot: SchedulerSlot };

export function slotAt(column: HTMLElement, clientY: number): SchedulerSlot {
  const day = parseDate(column.getAttribute('data-scheduler-column')!);
  const { top, height } = column.getBoundingClientRect();
  const minutesIn = ((clientY - top) / height) * MINUTES_IN_DAY;
  const minutes = clamp(
    Math.floor(minutesIn / SLOT_MINUTES) * SLOT_MINUTES,
    0,
    MINUTES_IN_DAY - SLOT_MINUTES,
  );
  const start = toCalendarDateTime(day).add({ minutes });
  return { start, end: start.add({ minutes: SLOT_MINUTES }) };
}

export type SchedulerContextMenuProps<E extends SchedulerEventData> = {
  events: readonly E[];
  format: SchedulerFormat;
  eventMenu: ((event: E) => ReactNode) | undefined;
  slotMenu: ((slot: SchedulerSlot) => ReactNode) | undefined;
  children: ReactElement;
};

export function SchedulerContextMenu<E extends SchedulerEventData>({
  events,
  format,
  eventMenu,
  slotMenu,
  children,
}: SchedulerContextMenuProps<E>) {
  const [target, setTarget] = useState<Target<E> | null>(null);

  if (!eventMenu && !slotMenu) return children;

  const targetOf = (event: MouseEvent<HTMLElement>): Target<E> | null => {
    if (!(event.target instanceof Element)) return null;

    const slotted = event.target.closest('[data-scheduler-slot]');
    if (slotted) {
      const id = slotted.getAttribute('data-scheduler-slot');
      const found = events.find((item) => item.id === id);
      return found && eventMenu ? { event: found } : null;
    }

    const column = event.target.closest<HTMLElement>('[data-scheduler-column]');
    return column && slotMenu ? { slot: slotAt(column, event.clientY) } : null;
  };

  const label =
    target && ('event' in target ? target.event.title : format.moment(target.slot.start));

  return (
    <Menu triggerType="contextmenu">
      <Menu.Trigger
        asChild
        onContextMenuCapture={(event: MouseEvent<HTMLElement>) => {
          const next = targetOf(event);
          if (!next) return event.stopPropagation();
          setTarget(next);
        }}
      >
        {children}
      </Menu.Trigger>
      <Menu.Content aria-label={label ?? undefined}>
        {target && ('event' in target ? eventMenu?.(target.event) : slotMenu?.(target.slot))}
      </Menu.Content>
    </Menu>
  );
}
