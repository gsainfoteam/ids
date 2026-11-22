import { dragSurface } from '../../../internal/drag-surface';
import { cn, tv } from '../../../utils';

import type { SchedulerColorScheme, SchedulerView } from './layout';

export const schedulerStyle = tv({
  slots: {
    root: [
      'flex h-144 min-h-0 w-full min-w-0 flex-col gap-3 text-neutral-strong',
      '[--scheduler-hour:calc(var(--spacing)*12)] [--scheduler-gutter:calc(var(--spacing)*16)]',
    ],
    toolbar: 'flex flex-wrap items-center gap-2',
    rangeIcon: 'text-neutral',
    views: 'ms-auto flex items-center gap-2',
    dayCount: 'w-28',
    datePopup: 'w-auto',
    board: 'min-h-0 flex-1 rounded-container border border-neutral',
    viewport: 'isolate',
    canvas: [
      'flex min-h-full flex-col',
      'min-w-[calc(var(--scheduler-gutter)+var(--scheduler-days)*var(--scheduler-day-min))]',
    ],
    sticky: 'sticky top-0 z-20',
    columns: 'grid grid-cols-[var(--scheduler-gutter)_repeat(var(--scheduler-days),minmax(0,1fr))]',
    header: 'border-b border-neutral bg-block',
    corner: 'sticky start-0 z-10 border-e border-neutral bg-block',
    dayHead: [
      'flex min-w-0 flex-col items-center gap-0.5 border-e border-neutral py-2 last:border-e-0',
      'text-caption-c1-medium text-neutral',
    ],
    dayNumber: [
      'flex size-8 items-center justify-center rounded-full',
      'text-body-b2-medium text-neutral-strong tabular-nums',
    ],
    hidden: 'sr-only',
    allDay: 'border-b border-neutral bg-(--ids-bg-current)',
    allDayLabel: [
      'sticky start-0 z-10 col-start-1 row-start-1 flex items-start justify-end border-e border-neutral bg-(--ids-bg-current) pe-2 pt-2',
      'text-caption-c1-regular whitespace-nowrap text-neutral',
    ],
    allDayCell:
      'col-start-(--scheduler-cell-column) row-start-1 min-w-0 border-e border-neutral last-of-type:border-e-0',
    allDayList: [
      'col-start-2 -col-end-1 row-start-1 grid gap-y-1 py-1',
      'grid-cols-[repeat(var(--scheduler-days),minmax(0,1fr))]',
    ],
    allDayBar: [
      '@container flex min-w-0 px-1',
      'col-start-(--scheduler-bar-column) col-span-(--scheduler-bar-span) row-start-(--scheduler-bar-row)',
    ],
    body: 'relative',
    gutter: 'sticky start-0 z-10 flex flex-col border-e border-neutral bg-(--ids-bg-current)',
    hour: [
      'h-(--scheduler-hour) shrink-0 pe-2 text-end text-caption-c1-regular whitespace-nowrap text-neutral',
      'first:invisible [&>span]:relative [&>span]:-top-[0.6lh]',
    ],
    day: [
      'relative h-[calc(var(--scheduler-hour)*24)] min-w-0 border-e border-neutral last:border-e-0',
      'bg-[linear-gradient(to_bottom,var(--ids-color-border-neutral)_1px,transparent_1px)] bg-size-[100%_var(--scheduler-hour)]',
    ],
    dayEvents: 'absolute inset-0',
    selection: [
      'pointer-events-none absolute inset-x-1 z-3 rounded-standard px-1.5 py-0.5',
      'bg-primary-soft text-on-primary-soft inset-ring inset-ring-primary-strong',
      'text-caption-c1-medium tabular-nums',
      'top-[calc(var(--scheduler-hour)*var(--scheduler-selection-start))]',
      'h-[calc(var(--scheduler-hour)*var(--scheduler-selection-hours))]',
    ],
    slot: [
      'absolute flex p-px hover:z-4 has-focus-visible:z-4 has-data-dragging:z-4',
      'top-[calc(var(--scheduler-hour)*var(--scheduler-event-start))]',
      'h-[calc(var(--scheduler-hour)*var(--scheduler-event-hours))]',
      'start-[calc(100%*var(--scheduler-event-left))] w-[calc(100%*var(--scheduler-event-width))]',
    ],
    event: [
      'min-h-0 overflow-hidden rounded-standard px-1.5 py-0.5 outline-1 outline-(--ids-bg-current)',
      'bg-scheme-soft text-on-scheme-soft state-scheme [&_[data-item-description]]:text-on-scheme-soft',
    ],
    movable: [
      'group/slot relative isolate -my-px flex h-[calc(100%+2px)] w-full rounded-standard py-px',
      'has-data-[color-scheme=neutral]:scheme-neutral has-data-[color-scheme=primary]:scheme-primary',
      'has-data-[color-scheme=secondary]:scheme-secondary has-data-[color-scheme=tertiary]:scheme-tertiary',
      'has-data-[color-scheme=success]:scheme-success has-data-[color-scheme=warning]:scheme-warning',
      'has-data-[color-scheme=danger]:scheme-danger has-data-[color-scheme=info]:scheme-info',
    ],
    resizeHandle: [
      'after:h-2 before:opacity-0 group-hover/slot:before:opacity-100',
      'focus-visible:before:opacity-100 data-dragging:before:opacity-100',
      'before:bg-(--ids-color-border-scheme-strong) hover:before:bg-(--ids-color-text-scheme)',
      'data-dragging:before:bg-(--ids-color-text-scheme)',
    ],
    eventContent: '',
    eventStart: 'hidden shrink-0 text-caption-c1-regular tabular-nums @min-[7.5rem]:inline',
    eventDot: 'size-2 shrink-0 self-center rounded-full bg-scheme-solid',
    eventTitle: '',
    eventTime: '',
    monthCanvas:
      'flex min-h-full min-w-[calc(var(--scheduler-days)*var(--scheduler-day-min))] flex-col',
    monthHead: 'sticky top-0 z-20 grid grid-cols-7 border-b border-neutral bg-block',
    monthWeekday: [
      'border-e border-neutral py-2 text-center last:border-e-0',
      'text-caption-c1-medium text-neutral',
    ],
    monthWeek: 'grid min-h-28 flex-1 grid-cols-7 border-b border-neutral last:border-b-0',
    monthDay:
      'col-start-(--scheduler-cell-column) row-start-1 min-w-0 border-e border-neutral p-1 last-of-type:border-e-0',
    monthDate: [
      'flex size-7 items-center justify-center rounded-full',
      'text-caption-c1-medium text-neutral-strong tabular-nums',
    ],
    monthList: [
      'pointer-events-none col-start-1 -col-end-1 row-start-1 grid grid-cols-7 content-start gap-y-0.5 pt-9 pb-1',
      '*:pointer-events-auto',
    ],
    monthMovable: 'relative isolate flex w-full min-w-0 rounded-standard',
    monthMore:
      'col-start-(--scheduler-bar-column) row-start-(--scheduler-bar-row) flex min-w-0 px-1',
    now: [
      'pointer-events-none absolute inset-x-0 z-1 h-0.5 bg-danger-solid',
      'top-[calc(var(--scheduler-hour)*var(--scheduler-now)-1px)]',
      'before:absolute before:-start-1 before:-top-1 before:size-2.5 before:rounded-full before:bg-danger-solid',
    ],
  },
  variants: {
    today: {
      true: {
        dayHead: 'text-primary',
        dayNumber: 'bg-primary-solid text-on-primary-solid',
        monthDate: 'bg-primary-solid text-on-primary-solid',
      },
      false: {},
    },
    outside: {
      true: { monthDay: 'bg-block', monthDate: 'text-neutral' },
      false: {},
    },
    selected: {
      true: { monthDay: 'bg-primary-soft' },
      false: {},
    },
    startsAt: {
      true: { eventContent: 'flex-row items-baseline gap-1', eventTitle: 'min-w-0 flex-1' },
      false: {},
    },
    line: {
      true: {
        event: 'bg-transparent text-neutral-strong',
        eventStart: 'text-neutral',
      },
      false: {},
    },
    fromBefore: {
      true: { allDayBar: 'ps-0', event: 'rounded-s-none' },
      false: {},
    },
    pastEnd: {
      true: { allDayBar: 'pe-0', event: 'rounded-e-none' },
      false: {},
    },
    dragging: {
      true: {
        movable: cn('z-5', dragSurface.lifted),
        monthMovable: cn('z-5', dragSurface.lifted),
      },
      false: {},
    },
    view: {
      month: { root: '[--scheduler-days:7] [--scheduler-day-min:0px]' },
      week: { root: '[--scheduler-day-min:calc(var(--spacing)*22)]' },
      days: { root: '[--scheduler-day-min:calc(var(--spacing)*22)]' },
      day: { root: '[--scheduler-day-min:0px]' },
    } satisfies Record<SchedulerView, object>,
    allDay: {
      true: { event: 'w-full', eventTime: 'sr-only' },
      false: {
        event: 'h-full items-start [container-type:size]',
        eventContent: [
          '[--scheduler-title-lines:1]',
          '[@container(min-height:3.45rem)]:[--scheduler-title-lines:2]',
          '[@container(min-height:4.45rem)]:[--scheduler-title-lines:3]',
          '[@container(min-height:5.45rem)]:[--scheduler-title-lines:4]',
        ],
        eventTitle: [
          'block max-w-full break-keep wrap-anywhere line-clamp-(--scheduler-title-lines)',
          '[&>[data-surface-trigger]]:line-clamp-(--scheduler-title-lines)',
        ],
        eventTime: 'hidden truncate [@container(min-height:2.4rem)]:block',
      },
    },
    colorScheme: {
      neutral: { event: 'scheme-neutral' },
      primary: { event: 'scheme-primary' },
      secondary: { event: 'scheme-secondary' },
      tertiary: { event: 'scheme-tertiary' },
      success: { event: 'scheme-success' },
      warning: { event: 'scheme-warning' },
      danger: { event: 'scheme-danger' },
      info: { event: 'scheme-info' },
    } satisfies Record<SchedulerColorScheme, object>,
  },
  defaultVariants: {
    view: 'week',
    today: false,
    outside: false,
    selected: false,
    startsAt: false,
    line: false,
    fromBefore: false,
    pastEnd: false,
    allDay: false,
    dragging: false,
    colorScheme: 'primary',
  },
});
