import { primaryFill } from '../../../internal/brand-fill';
import { fieldSurface } from '../../../internal/field-surface';
import { cn, tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const calendarStyle = tv({
  slots: {
    root: 'relative w-fit min-w-0 text-on-surface',
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
      fieldSurface.base,
      fieldSurface.variant.outline,
      'relative inline-flex min-w-0 items-center rounded-standard',
    ],
    dropdown:
      'absolute inset-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed',
    dropdownLabel: [
      'pointer-events-none flex h-(--calendar-dropdown) items-center gap-1 ps-2 pe-1 font-medium whitespace-nowrap',
      '[&_svg]:size-3.5 [&_svg]:text-neutral',
    ],
    grid: 'col-span-3 row-start-2',
    weekdays: 'flex',
    weekday: [
      'flex h-(--calendar-weekday) w-(--calendar-cell) items-center justify-center p-0',
      'font-normal text-neutral select-none',
    ],
    week: 'flex not-first:mt-1',
    weekNumber: [
      'flex h-(--calendar-cell) w-(--calendar-cell) items-center justify-center p-0',
      'text-caption-c1-regular text-neutral select-none',
    ],
    day: [
      'relative size-(--calendar-cell) p-0 text-center',
      'first:rounded-s-standard last:rounded-e-standard',
      '[[data-hidden]+&]:rounded-s-standard [&:has(+[data-hidden])]:rounded-e-standard',
    ],
    rangeStart: 'rounded-s-standard bg-primary-soft',
    rangeMiddle: 'bg-primary-soft',
    rangeEnd: 'rounded-e-standard bg-primary-soft',
    previewStart: 'rounded-s-standard bg-neutral-soft',
    previewMiddle: 'bg-neutral-soft',
    previewEnd: 'rounded-e-standard bg-neutral-soft',
    hidden: 'invisible',
    dayButton: [
      'relative inline-flex size-full cursor-pointer items-center justify-center rounded-standard',
      'tabular-nums select-none focus-ring focus-ring-visible:z-10',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
      'motion-reduce:transition-none',
    ],
    footer: 'mt-3 text-caption-c1-regular text-neutral',
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
    outside: { true: { dayButton: 'text-neutral' } },
    selected: {
      true: {
        dayButton: cn(
          primaryFill,
          'bg-(--control-fill) font-medium text-(--control-on-fill) hover:bg-(--control-fill-hover)',
        ),
      },
    },
    band: {
      none: {},
      range: {
        dayButton: 'text-on-primary-soft hover:bg-primary-soft-hover active:bg-primary-soft-active',
      },
      preview: {
        dayButton: 'hover:bg-neutral-soft-hover active:bg-neutral-soft-active',
      },
    },
    unavailable: { true: { dayButton: 'cursor-not-allowed opacity-50' } },
  },
  compoundVariants: [
    {
      selected: false,
      today: true,
      class: { dayButton: 'text-primary inset-ring-1 inset-ring-primary' },
    },
    {
      selected: false,
      band: 'none',
      unavailable: false,
      class: { dayButton: 'hover:bg-neutral-soft active:bg-neutral-soft-hover' },
    },
    { selected: true, unavailable: true, class: { dayButton: 'hover:bg-primary' } },
    {
      band: ['range', 'preview'],
      unavailable: true,
      class: { dayButton: 'hover:bg-transparent active:bg-transparent' },
    },
  ],
  defaultVariants: {
    size: 'standard',
    selected: false,
    band: 'none',
    today: false,
    outside: false,
    unavailable: false,
  },
});
