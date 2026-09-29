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
    glossy: cn(
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-press)',
      'data-pressed:bg-(--control-fill) data-pressed:text-(--control-on-fill) data-pressed:shadow-sm',
      'data-pressed:bg-linear-to-b data-pressed:from-white/20 data-pressed:to-transparent',
      'data-pressed:inset-shadow-[0_1px_0_rgb(255_255_255/0.35)]',
      'data-pressed:inset-ring-1 data-pressed:inset-ring-[color-mix(in_oklab,var(--control-fill),black_20%)]',
    ),
  } satisfies Record<IdsVariant, string>,
} as const;
