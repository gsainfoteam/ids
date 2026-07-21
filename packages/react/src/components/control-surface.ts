import type { IdsSize, IdsVariant } from '../tokens/types';

export const controlSurface = {
  base: [
    'inline-flex items-center justify-center gap-2 select-none transition-all',
    'cursor-pointer data-disabled:cursor-not-allowed',
    'data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-(--ids-color-primary)',
    'data-active:scale-[0.98] data-disabled:opacity-40',
    'motion-reduce:transition-none motion-reduce:data-active:scale-100',
  ],
  size: {
    standard: 'h-11 px-4.5 text-button-standard rounded-xl',
    tiny: 'h-8 px-2.5 text-button-tiny rounded-lg',
  } satisfies Record<IdsSize, string>,
  variant: {
    solid:
      'bg-(--ids-color-primary) text-(--ids-color-on-primary) data-hovered:bg-(--ids-color-primary)/90 data-active:bg-(--ids-color-primary)/80 data-pressed:bg-(--ids-color-primary)/80',
    soft: 'bg-(--ids-color-primary)/15 text-(--ids-color-primary) data-hovered:bg-(--ids-color-primary)/20 data-active:bg-(--ids-color-primary)/25 data-pressed:bg-(--ids-color-primary)/25',
    outline:
      'inset-ring-1 inset-ring-(--ids-color-outline) bg-transparent text-(--ids-color-primary) data-hovered:bg-(--ids-color-primary)/10 data-active:bg-(--ids-color-primary)/15 data-pressed:bg-(--ids-color-primary)/15',
    ghost:
      'bg-transparent text-(--ids-color-primary) data-hovered:bg-(--ids-color-primary)/10 data-active:bg-(--ids-color-primary)/15 data-pressed:bg-(--ids-color-primary)/15',
  } satisfies Record<IdsVariant, string>,
} as const;
