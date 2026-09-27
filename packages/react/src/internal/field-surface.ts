import type { IdsSize } from '../tokens/types';

export type FieldSurfaceVariant = 'outline' | 'soft' | 'ghost';

// The box every text-like control draws: TextField's container, a Select or date trigger, a
// ChipField. Only the intensity varies. Focus and invalid colors come from `focus-ring`, which
// recolors the inset-ring border drawn here, so this file never repeats those states.
export const fieldSurface = {
  base: [
    'text-(--ids-color-on-surface) focus-ring',
    'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  variant: {
    outline: [
      'bg-(--ids-color-surface) shadow-xs inset-ring-1 inset-ring-(--ids-color-border)',
      'dark:bg-(--ids-color-muted)/30',
    ],
    soft: 'bg-(--ids-color-muted) inset-ring-1 inset-ring-transparent',
    ghost: 'bg-transparent inset-ring-1 inset-ring-transparent',
  } satisfies Record<FieldSurfaceVariant, string | string[]>,
  size: {
    standard: 'h-(--ids-size-control-standard) gap-2 rounded-standard px-3 text-body-b3-regular',
    tiny: 'h-(--ids-size-control-tiny) gap-1.5 rounded-standard px-2.5 text-caption-c1-regular',
  } satisfies Record<IdsSize, string>,
} as const;
