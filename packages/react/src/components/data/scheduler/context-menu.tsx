'use client';

import {
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { parseDate, toCalendarDate, toCalendarDateTime } from '@internationalized/date';
import { clamp } from 'es-toolkit';

import { HOURS_IN_DAY, type SchedulerEventData, type SchedulerSlot } from './layout';
import { part } from '../../../utils';
import { Menu } from '../../overlay/menu';
import { useMenuContext } from '../../overlay/menu/context';

import type { SchedulerFormat } from './format';

const MINUTES_IN_DAY = HOURS_IN_DAY * 60;
const SLOT_MINUTES = 30;

type Target<E extends SchedulerEventData> =
  | { event: E; label: string }
  | { slot: SchedulerSlot; label: string };

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

function wholeDayOf(cell: Element): SchedulerSlot {
  const start = toCalendarDateTime(parseDate(cell.getAttribute('data-scheduler-month-day')!));
  return { start, end: start.add({ days: 1 }) };
}

function TriggerWhereAMenuIs({
  opens,
  children,
}: {
  opens: (event: MouseEvent<HTMLElement>) => boolean;
  children: ReactElement;
}) {
  const { root } = useMenuContext('Scheduler');

  return part('div', true, children, {
    ref: root.setTrigger,
    'data-popup-open': root.open ? '' : undefined,
    onContextMenu: (event: MouseEvent<HTMLElement>) => {
      if (event.defaultPrevented || !opens(event)) return;
      event.preventDefault();
      root.openAt(event.nativeEvent);
    },
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      const plainPress = event.button === 0 && !event.ctrlKey;
      const pressedInMenu = !!root.content?.contains(event.target as Node);
      if (root.open && plainPress && !pressedInMenu) root.setOpen(false, event.nativeEvent);
    },
  });
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
      return found && eventMenu ? { event: found, label: found.title } : null;
    }

    if (!slotMenu) return null;

    const column = event.target.closest<HTMLElement>('[data-scheduler-column]');
    if (column) {
      const slot = slotAt(column, event.clientY);
      return { slot, label: format.moment(slot.start) };
    }

    const cell = event.target.closest('[data-scheduler-month-day]');
    if (cell) {
      const slot = wholeDayOf(cell);
      return { slot, label: format.fullDate(toCalendarDate(slot.start)) };
    }

    return null;
  };

  return (
    <Menu triggerType="contextmenu">
      <TriggerWhereAMenuIs
        opens={(event) => {
          const next = targetOf(event);
          if (next) setTarget(next);
          return next !== null;
        }}
      >
        {children}
      </TriggerWhereAMenuIs>
      <Menu.Content aria-label={target?.label}>
        {target && ('event' in target ? eventMenu?.(target.event) : slotMenu?.(target.slot))}
      </Menu.Content>
    </Menu>
  );
}
