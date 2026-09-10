import { focusRing } from './focus-ring';

import type { IdsSize, IdsVariant } from '../tokens/types';

export const controlSurface = {
  base: [
    'inline-flex items-center justify-center gap-2 select-none',
    'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
    'cursor-pointer data-disabled:cursor-not-allowed',
    focusRing.data,
    'data-disabled:opacity-50',
    'motion-reduce:transition-none',
  ],
  size: {
    standard: 'h-11 rounded-md px-4.5 text-button-standard',
    tiny: 'h-8 rounded-sm px-2.5 text-button-tiny',
  } satisfies Record<IdsSize, string>,
  variant: {
    solid:
      'bg-(--ids-color-primary) text-(--ids-color-on-primary) data-hovered:bg-(--ids-color-primary)/90 data-active:bg-(--ids-color-primary)/80 data-pressed:bg-(--ids-color-primary)/80',
    soft: 'bg-(--ids-color-primary)/15 text-(--ids-color-primary) data-hovered:bg-(--ids-color-primary)/20 data-active:bg-(--ids-color-primary)/25 data-pressed:bg-(--ids-color-primary)/25',
    outline:
      'shadow-xs inset-ring-1 inset-ring-(--ids-color-outline) bg-transparent text-(--ids-color-primary) data-hovered:bg-(--ids-color-primary)/10 data-active:bg-(--ids-color-primary)/15 data-pressed:bg-(--ids-color-primary)/15',
    ghost:
      'bg-transparent text-(--ids-color-primary) data-hovered:bg-(--ids-color-primary)/10 data-active:bg-(--ids-color-primary)/15 data-pressed:bg-(--ids-color-primary)/15',
  } satisfies Record<IdsVariant, string>,
} as const;
