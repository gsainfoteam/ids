import { cn, tv } from '../../utils';
import { fieldSurface, type FieldSurfaceVariant } from '../field-surface';

import type { IdsSize } from '../../tokens/types';

export type FieldTriggerVariant = FieldSurfaceVariant;

export const fieldTrigger = {
  base: cn('flex w-full min-w-0 touch-manipulation items-center text-start', fieldSurface.base),
  variant: fieldSurface.variant,
  size: fieldSurface.size,
  icon: {
    standard: cn('size-(--ids-size-icon-standard)'),
    tiny: cn('size-(--ids-size-icon-tiny)'),
  } satisfies Record<IdsSize, string>,
} as const;

export const fieldListbox = {
  option: cn(
    'relative flex cursor-default items-center gap-2 rounded-standard py-1.5 ps-2.5 pe-8 outline-none select-none wrap-anywhere',
    'data-highlighted:bg-(--ids-color-muted)',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ),
  indicator: cn(
    'pointer-events-none absolute end-2.5 flex items-center justify-center',
    '[&_svg]:size-(--ids-size-icon-standard)',
  ),
  list: cn(
    'relative -mx-1 flex min-h-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-1',
    'outline-none [overflow-anchor:none]',
  ),
  heading: cn('px-2.5 pt-2 pb-1 text-caption-c1-medium text-(--ids-color-on-muted)'),
  separator: cn('-mx-1 my-1 w-auto'),
  empty: cn('px-2.5 py-6 text-center text-body-b3-regular text-(--ids-color-on-muted)'),
  searchRoot: cn(
    '-mx-1 -mt-1 mb-1 h-auto w-auto rounded-none border-b border-(--ids-color-border)',
    'ring-0! inset-ring-transparent!',
  ),
  search: cn('h-10'),
} as const;

export const popupStyle = tv({
  slots: {
    popup: [
      'fixed z-50 m-0 flex flex-col overflow-auto overscroll-contain concentric-p-1 [overflow-anchor:none]',
      'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface)',
      'text-body-b3-regular shadow-md outline-none',
      'transition-[opacity,scale,translate] duration-(--ids-motion-fast) ease-out',
      'motion-reduce:transition-none',
    ],
    backdrop: [
      'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none touch-none overflow-hidden border-0 p-0',
      'bg-black/50 transition-opacity duration-(--ids-motion-normal) starting:opacity-0',
      'motion-reduce:transition-none',
    ],
    header:
      '-mt-1 mb-2 hidden items-center justify-between ps-1 in-data-[presentation=drawer]:flex',
    title: 'text-body-b3-medium',
  },
  variants: {
    presentation: {
      popover: {
        popup: [
          'starting:scale-95 starting:opacity-0',
          'data-[side=bottom]:origin-top data-[side=top]:origin-bottom',
        ],
      },
      drawer: {
        popup: 'shadow-lg duration-(--ids-motion-normal) starting:translate-y-4 starting:opacity-0',
      },
    },
  },
  defaultVariants: { presentation: 'popover' },
});
