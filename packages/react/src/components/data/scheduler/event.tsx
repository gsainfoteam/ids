'use client';

import { type ReactNode } from 'react';

import { useSchedulerEventContext } from './context';
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
  const { styles, format, event, start, end, allDay } = useSchedulerEventContext('Scheduler.Event');
  const scheme = colorScheme ?? event.colorScheme ?? 'primary';

  return (
    <Item
      {...props}
      size="tiny"
      variant={variant}
      data-scheduler-event={event.id}
      data-color-scheme={scheme}
      className={(state) =>
        styles.event({
          allDay,
          colorScheme: scheme,
          className: typeof className === 'function' ? className(state) : className,
        })
      }
    >
      {children ?? (
        <Item.Content>
          <Item.Title truncate>{event.title}</Item.Title>
          {!allDay && (
            <Item.Description>
              <time dateTime={start.toString()}>{format.time(start)}</time>
              {' – '}
              <time dateTime={end.toString()}>{format.time(end)}</time>
            </Item.Description>
          )}
        </Item.Content>
      )}
    </Item>
  );
}

SchedulerEvent.displayName = 'Scheduler.Event';
