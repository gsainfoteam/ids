import { cn } from '../utils/cn';

import type { IdsSize } from '../tokens/types';

export type FieldSurfaceVariant = 'outline' | 'soft' | 'ghost';

// The box every text-like control draws: TextField's container, a Select or date trigger, a
// ChipField. Only the intensity varies. Focus and invalid colors come from `focus-ring`, which
// recolors the inset-ring border drawn here, so this file never repeats those states.
export const fieldSurface = {
  base: cn(
    'text-(--ids-color-on-surface) focus-ring',
    'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ),
  variant: {
    outline: cn(
      'bg-(--ids-color-surface) shadow-xs inset-ring-1 inset-ring-(--ids-color-border)',
      'dark:bg-(--ids-color-muted)/30',
    ),
    soft: cn('bg-(--ids-color-muted) inset-ring-1 inset-ring-transparent'),
    ghost: cn('bg-transparent inset-ring-1 inset-ring-transparent'),
  } satisfies Record<FieldSurfaceVariant, string>,
  size: {
    standard: cn(
      'h-(--ids-size-control-standard) gap-2 rounded-standard px-3 text-body-b3-regular',
    ),
    tiny: cn('h-(--ids-size-control-tiny) gap-1.5 rounded-standard px-2.5 text-caption-c1-regular'),
  } satisfies Record<IdsSize, string>,
} as const;

export const fieldAction = {
  base: cn(
    'shrink-0 text-(--ids-color-on-muted)',
    'data-hovered:text-(--ids-color-on-surface) data-active:text-(--ids-color-on-surface)',
    'data-pressed:text-(--ids-color-on-surface)',
  ),
  padded: {
    standard: cn('size-7 first:-ms-2 last:-me-2'),
    tiny: cn('size-6 first:-ms-1.5 last:-me-1.5'),
  } satisfies Record<IdsSize, string>,
  unpadded: {
    standard: cn('size-7 me-1 first:ms-1'),
    tiny: cn('size-6 me-1 first:ms-1'),
  } satisfies Record<IdsSize, string>,
} as const;
