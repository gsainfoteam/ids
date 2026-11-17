import { tv } from '../../../utils';

import type { SchedulerColorScheme, SchedulerView } from './layout';

export const schedulerStyle = tv({
  slots: {
    root: [
      'flex h-144 min-h-0 w-full min-w-0 flex-col gap-3 text-on-surface',
      '[--scheduler-hour:calc(var(--spacing)*12)] [--scheduler-gutter:calc(var(--spacing)*16)]',
    ],
    toolbar: 'flex flex-wrap items-center gap-2',
    rangeIcon: 'text-neutral',
    views: 'ms-auto',
    datePopup: 'w-auto',
    board: 'min-h-0 flex-1 rounded-container border border-neutral',
    canvas: [
      'flex min-h-full flex-col',
      'min-w-[calc(var(--scheduler-gutter)+var(--scheduler-days)*var(--scheduler-day-min))]',
    ],
    sticky: 'sticky top-0 z-20',
    columns: 'grid grid-cols-[var(--scheduler-gutter)_repeat(var(--scheduler-days),minmax(0,1fr))]',
    header: 'border-b border-neutral bg-neutral-soft',
    corner: 'sticky start-0 z-10 border-e border-neutral bg-neutral-soft',
    dayHead: [
      'flex min-w-0 flex-col items-center gap-0.5 border-e border-neutral py-2 last:border-e-0',
      'text-caption-c1-medium text-neutral',
    ],
    dayNumber: [
      'flex size-8 items-center justify-center rounded-full',
      'text-body-b2-medium text-on-surface tabular-nums',
    ],
    hidden: 'sr-only',
    allDay: 'border-b border-neutral bg-surface',
    allDayLabel: [
      'sticky start-0 z-10 flex items-start justify-end border-e border-neutral bg-surface pe-2 pt-2',
      'text-caption-c1-regular whitespace-nowrap text-neutral',
    ],
    allDayCell: 'min-w-0 border-e border-neutral p-1 last:border-e-0',
    allDayList: 'gap-1',
    body: 'relative',
    gutter: 'sticky start-0 z-10 flex flex-col border-e border-neutral bg-surface',
    hour: [
      'h-(--scheduler-hour) shrink-0 pe-2 text-end text-caption-c1-regular whitespace-nowrap text-neutral',
      'first:invisible [&>span]:relative [&>span]:-top-[0.6lh]',
    ],
    day: [
      'relative h-[calc(var(--scheduler-hour)*24)] min-w-0 border-e border-neutral last:border-e-0',
      'bg-[linear-gradient(to_bottom,var(--ids-color-border-neutral)_1px,transparent_1px)] bg-size-[100%_var(--scheduler-hour)]',
    ],
    dayEvents: 'absolute inset-y-0 start-0 end-2',
    slot: [
      'absolute flex p-px',
      'top-[calc(var(--scheduler-hour)*var(--scheduler-event-start))]',
      'h-[calc(var(--scheduler-hour)*var(--scheduler-event-hours))]',
      'start-[calc(100%*var(--scheduler-event-lane)/var(--scheduler-event-lanes))]',
      'w-[calc(100%/var(--scheduler-event-lanes))]',
    ],
    event: 'min-h-0 overflow-hidden rounded-standard px-1.5 py-1',
    now: [
      'pointer-events-none absolute inset-x-0 z-1 h-0.5 bg-danger',
      'top-[calc(var(--scheduler-hour)*var(--scheduler-now)-1px)]',
      'before:absolute before:-start-1 before:-top-1 before:size-2.5 before:rounded-full before:bg-danger',
    ],
  },
  variants: {
    today: {
      true: { dayHead: 'text-primary', dayNumber: 'bg-primary text-on-primary' },
      false: {},
    },
    view: {
      week: { root: '[--scheduler-day-min:calc(var(--spacing)*22)]' },
      day: { root: '[--scheduler-day-min:0px]' },
    } satisfies Record<SchedulerView, object>,
    allDay: {
      true: { event: 'w-full py-0.5' },
      false: { event: 'h-full items-start' },
    },
    colorScheme: {
      neutral: { event: 'bg-neutral-soft text-on-surface' },
      primary: {
        event:
          'bg-primary-soft text-on-primary-soft [&_[data-item-description]]:text-on-primary-soft',
      },
      secondary: {
        event:
          'bg-secondary-soft text-on-secondary-soft [&_[data-item-description]]:text-on-secondary-soft',
      },
      tertiary: {
        event:
          'bg-tertiary-soft text-on-tertiary-soft [&_[data-item-description]]:text-on-tertiary-soft',
      },
      success: {
        event:
          'bg-success-soft text-on-success-soft [&_[data-item-description]]:text-on-success-soft',
      },
      warning: {
        event:
          'bg-warning-soft text-on-warning-soft [&_[data-item-description]]:text-on-warning-soft',
      },
      danger: {
        event: 'bg-danger-soft text-on-danger-soft [&_[data-item-description]]:text-on-danger-soft',
      },
      info: {
        event: 'bg-info-soft text-on-info-soft [&_[data-item-description]]:text-on-info-soft',
      },
    } satisfies Record<SchedulerColorScheme, object>,
  },
  defaultVariants: { view: 'week', today: false, allDay: false, colorScheme: 'primary' },
});
