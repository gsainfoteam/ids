import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const calendarStyle = tv({
  slots: {
    root: 'relative w-fit min-w-0 text-(--ids-color-on-surface)',
    months: 'flex flex-wrap gap-4',
    month:
      'grid grid-cols-[var(--calendar-cell)_minmax(0,1fr)_var(--calendar-cell)] content-start gap-y-2',
    previous: 'col-start-1 row-start-1 size-(--calendar-cell)',
    next: 'col-start-3 row-start-1 size-(--calendar-cell)',
    chevron: 'size-(--calendar-icon)',
    caption: 'col-start-2 row-start-1 flex h-(--calendar-cell) min-w-0 items-center justify-center',
    captionLabel: 'truncate font-medium select-none',
    dropdowns: 'flex min-w-0 items-center justify-center gap-1.5',
    dropdownRoot: [
      'relative inline-flex min-w-0 items-center rounded-standard shadow-xs',
      'inset-ring-1 inset-ring-(--ids-color-border) focus-ring',
      'data-disabled:opacity-50',
    ],
    dropdown:
      'absolute inset-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed',
    dropdownLabel: [
      'pointer-events-none flex h-(--calendar-dropdown) items-center gap-1 ps-2 pe-1 font-medium whitespace-nowrap',
      '[&_svg]:size-3.5 [&_svg]:text-(--ids-color-on-muted)',
    ],
    grid: 'col-span-3 row-start-2',
    weekdays: 'flex',
    weekday: [
      'flex h-(--calendar-weekday) w-(--calendar-cell) items-center justify-center p-0',
      'font-normal text-(--ids-color-on-muted) select-none',
    ],
    week: 'flex not-first:mt-1',
    weekNumber: [
      'flex h-(--calendar-cell) w-(--calendar-cell) items-center justify-center p-0',
      'text-caption-c1-regular text-(--ids-color-on-muted) select-none',
    ],
    day: [
      'relative size-(--calendar-cell) p-0 text-center',
      'first:rounded-s-standard last:rounded-e-standard',
      '[[data-hidden]+&]:rounded-s-standard [&:has(+[data-hidden])]:rounded-e-standard',
    ],
    rangeStart: 'rounded-s-standard bg-(--ids-color-muted)',
    rangeMiddle: 'bg-(--ids-color-muted)',
    rangeEnd: 'rounded-e-standard bg-(--ids-color-muted)',
    hidden: 'invisible',
    dayButton: [
      'relative inline-flex size-full cursor-pointer items-center justify-center rounded-standard',
      'tabular-nums select-none focus-ring focus-visible:z-10',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
      'motion-reduce:transition-none',
    ],
    footer: 'mt-3 text-caption-c1-regular text-(--ids-color-on-muted)',
  },
  variants: {
    size: {
      standard: {
        root: [
          'text-body-b3-regular',
          '[--calendar-cell:var(--ids-size-control-standard)] [--calendar-dropdown:--spacing(8)] [--calendar-weekday:--spacing(8)]',
          '[--calendar-icon:var(--ids-size-icon-standard)]',
        ],
      },
      tiny: {
        root: [
          'text-caption-c1-regular',
          '[--calendar-cell:var(--ids-size-control-tiny)] [--calendar-dropdown:--spacing(7)] [--calendar-weekday:--spacing(7)]',
          '[--calendar-icon:var(--ids-size-icon-tiny)]',
        ],
      },
    } satisfies Record<IdsSize, object>,
    today: { true: { dayButton: 'font-semibold' } },
    outside: { true: { dayButton: 'text-(--ids-color-on-muted)' } },
    selected: {
      true: {
        dayButton:
          'bg-(--ids-color-primary) font-medium text-(--ids-color-on-primary) hover:bg-(--ids-color-primary)/90',
      },
    },
    onBand: {
      true: {
        dayButton: 'hover:bg-(--ids-color-muted-hover) active:bg-(--ids-color-muted-active)',
      },
    },
    unavailable: { true: { dayButton: 'cursor-not-allowed opacity-50' } },
  },
  compoundVariants: [
    {
      selected: false,
      onBand: false,
      today: true,
      class: { dayButton: 'bg-(--ids-color-muted)' },
    },
    {
      selected: false,
      onBand: false,
      unavailable: false,
      class: { dayButton: 'hover:bg-(--ids-color-muted) active:bg-(--ids-color-muted-hover)' },
    },
    {
      selected: false,
      onBand: false,
      unavailable: false,
      today: true,
      class: {
        dayButton: 'hover:bg-(--ids-color-muted-hover) active:bg-(--ids-color-muted-active)',
      },
    },
    { selected: true, unavailable: true, class: { dayButton: 'hover:bg-(--ids-color-primary)' } },
    {
      onBand: true,
      unavailable: true,
      class: { dayButton: 'hover:bg-transparent active:bg-transparent' },
    },
  ],
  defaultVariants: {
    size: 'standard',
    selected: false,
    onBand: false,
    today: false,
    outside: false,
    unavailable: false,
  },
});
