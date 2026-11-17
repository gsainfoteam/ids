import { cn } from '../utils/cn';

import type { SurfaceVariant } from './control-surface';
import type { IdsVariant } from '../tokens/types';

const variant = {
  ghost: cn(
    'bg-transparent text-(--control-quiet)',
    'data-hovered:bg-(--control-hover) data-active:bg-(--control-press)',
    'data-pressed:bg-(--control-press) data-pressed:text-(--control-on-press)',
  ),
  outline: cn(
    'bg-transparent text-(--control-quiet) shadow-xs inset-ring-1 inset-ring-neutral',
    'data-hovered:bg-(--control-hover) data-active:bg-(--control-press)',
    'data-pressed:bg-(--control-press) data-pressed:text-(--control-on-press)',
  ),
  soft: cn(
    'bg-transparent text-(--control-quiet)',
    'data-hovered:bg-(--control-hover) data-active:bg-(--control-press)',
    'data-pressed:bg-(--control-soft) data-pressed:text-(--control-on-soft)',
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
} satisfies Record<SurfaceVariant, string>;

export const toggleSurface = {
  variant,
  glyphVariant: {
    ...variant,
    transparent: cn(
      'bg-transparent text-on-surface',
      'transition-[color,background-color,border-color,box-shadow,opacity]',
      'data-active:opacity-40',
      'data-pressed:text-(--control-glyph-on)',
    ),
  } satisfies Record<IdsVariant, string>,
} as const;
