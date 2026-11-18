import { controlSurface, type SurfaceVariant } from './control-surface';
import { cn } from '../utils/cn';

import type { IdsVariant } from '../tokens/types';

const toggleStates = cn(
  'state-layer not-data-pressed:data-hovered:state-hover data-active:state-press',
);

const pressedShowsThePressLayer = cn('data-pressed:state-press');

const variant = {
  ghost: cn('bg-transparent text-(--control-quiet)', toggleStates, pressedShowsThePressLayer),
  outline: cn(
    'bg-transparent text-(--control-quiet) shadow-xs inset-ring-1 inset-ring-neutral',
    toggleStates,
    pressedShowsThePressLayer,
  ),
  soft: cn(
    'bg-transparent text-(--control-quiet)',
    'state-layer data-hovered:state-hover data-active:state-press',
    'data-pressed:bg-(--control-soft) data-pressed:text-(--control-on-soft)',
  ),
  solid: cn(
    'bg-transparent text-(--control-quiet)',
    'state-layer data-hovered:state-hover data-active:state-press',
    'data-pressed:bg-(--control-fill) data-pressed:text-(--control-on-fill) data-pressed:shadow-xs',
  ),
  glossy: cn(
    'bg-transparent text-(--control-quiet)',
    'state-layer data-hovered:state-hover data-active:state-press',
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
      controlSurface.variant.transparent,
      'text-neutral-bold data-pressed:text-(--control-glyph-on)',
      'data-pressed-hovered:opacity-70 data-pressed-active:opacity-40',
    ),
  } satisfies Record<IdsVariant, string>,
} as const;
