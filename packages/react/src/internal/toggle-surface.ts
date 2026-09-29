import { cn } from '../utils/cn';

import type { IdsVariant } from '../tokens/types';

export const toggleSurface = {
  variant: {
    ghost: cn(
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-press)',
      'data-pressed:bg-(--control-press)',
    ),
    outline: cn(
      'bg-transparent text-(--control-quiet) shadow-xs inset-ring-1 inset-ring-(--ids-color-border)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-press)',
      'data-pressed:bg-(--control-press)',
    ),
    soft: cn(
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-press)',
      'data-pressed:bg-(--control-fill)/10 data-pressed:text-(--control-accent)',
    ),
    solid: cn(
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-press)',
      'data-pressed:bg-(--control-fill) data-pressed:text-(--control-on-fill) data-pressed:shadow-xs',
    ),
  } satisfies Record<IdsVariant, string>,
} as const;
