'use client';

import { use, type ReactNode } from 'react';

import { toCalendarDate } from '@internationalized/date';

import { SchedulerDragContext, useSchedulerEventContext } from './context';
import { Item } from '../item';

import type { SchedulerColorScheme } from './layout';

export type SchedulerEventPartProps = Omit<Item.Props, 'children' | 'size'> & {
  colorScheme?: SchedulerColorScheme;
  children?: ReactNode;
};

export function SchedulerEvent({
  colorScheme,
  variant,
  className,
  children,
  ...props
}: SchedulerEventPartProps) {
  const {
    styles,
    format,
    event,
    start,
    end,
    allDay,
    inMonth = false,
  } = useSchedulerEventContext('Scheduler.Event');
  const oneLine = allDay || inMonth;
  const startsAt = inMonth && !allDay;
  const scheme = colorScheme ?? event.colorScheme ?? 'primary';
  const movable = use(SchedulerDragContext) !== null && !oneLine;
  const focusableToMove = movable && props.onClick === undefined;

  return (
    <Item
      tabIndex={focusableToMove ? 0 : undefined}
      {...props}
      size="tiny"
      variant={variant}
      data-scheduler-event={event.id}
      data-color-scheme={scheme}
      className={(state) =>
        styles.event({
          allDay: oneLine,
          colorScheme: scheme,
          className: typeof className === 'function' ? className(state) : className,
        })
      }
    >
      {children ?? (
        <Item.Content className={styles.eventContent({ allDay: oneLine, startsAt })}>
          {startsAt && (
            <span aria-hidden="true" className={styles.eventStart()}>
              {format.time(start)}
            </span>
          )}
          <Item.Title truncate={oneLine} className={styles.eventTitle({ allDay: oneLine })}>
            {event.title}
          </Item.Title>
          <Item.Description className={styles.eventTime({ allDay: oneLine })}>
            {allDay ? (
              format.dates(toCalendarDate(start), toCalendarDate(end))
            ) : inMonth ? (
              <time dateTime={start.toString()}>{format.moment(start)}</time>
            ) : (
              <>
                <time dateTime={start.toString()}>{format.time(start)}</time>
                {' – '}
                <time dateTime={end.toString()}>{format.time(end)}</time>
              </>
            )}
          </Item.Description>
        </Item.Content>
      )}
    </Item>
  );
}

SchedulerEvent.displayName = 'Scheduler.Event';
