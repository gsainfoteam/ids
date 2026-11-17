import { fillStatesAwayFromText } from './brand-fill';
import { cn } from '../utils/cn';

import type { IdsSize, IdsVariant } from '../tokens/types';

export type SurfaceVariant = Exclude<IdsVariant, 'transparent'>;

export type ControlColorScheme =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';

const quietNeutral = cn(
  '[--control-quiet:var(--ids-color-on-surface)] [--control-on-press:var(--ids-color-on-surface)]',
  '[--control-hover:var(--ids-color-bg-neutral-soft)] [--control-press:var(--ids-color-bg-neutral-soft-hover)]',
);

const schemes = {
  primary: cn(
    '[--control-fill:var(--ids-color-bg-primary)] [--control-on-fill:var(--ids-color-text-on-primary)]',
    '[--control-fill-hover:var(--ids-color-bg-primary-hover)] [--control-fill-press:var(--ids-color-bg-primary-active)]',
    '[--control-soft:var(--ids-color-bg-primary-soft)] [--control-on-soft:var(--ids-color-text-on-primary-soft)]',
    '[--control-soft-hover:var(--ids-color-bg-primary-soft-hover)] [--control-soft-press:var(--ids-color-bg-primary-soft-active)]',
    quietNeutral,
    '[--control-ring:var(--ids-color-border-primary)]',
    '[--control-glyph-on:var(--ids-color-text-primary)]',
  ),
  secondary: cn(
    '[--control-fill:var(--ids-color-bg-secondary)] [--control-on-fill:var(--ids-color-text-on-secondary)]',
    '[--control-fill-hover:var(--ids-color-bg-secondary-hover)] [--control-fill-press:var(--ids-color-bg-secondary-active)]',
    '[--control-soft:var(--ids-color-bg-secondary-soft)] [--control-on-soft:var(--ids-color-text-on-secondary-soft)]',
    '[--control-soft-hover:var(--ids-color-bg-secondary-soft-hover)] [--control-soft-press:var(--ids-color-bg-secondary-soft-active)]',
    quietNeutral,
    '[--control-ring:var(--ids-color-border-secondary)]',
    '[--control-glyph-on:var(--ids-color-text-secondary)]',
  ),
  tertiary: cn(
    '[--control-fill:var(--ids-color-bg-tertiary)] [--control-on-fill:var(--ids-color-text-on-tertiary)]',
    '[--control-fill-hover:var(--ids-color-bg-tertiary-hover)] [--control-fill-press:var(--ids-color-bg-tertiary-active)]',
    '[--control-soft:var(--ids-color-bg-tertiary-soft)] [--control-on-soft:var(--ids-color-text-on-tertiary-soft)]',
    '[--control-soft-hover:var(--ids-color-bg-tertiary-soft-hover)] [--control-soft-press:var(--ids-color-bg-tertiary-soft-active)]',
    quietNeutral,
    '[--control-ring:var(--ids-color-border-tertiary)]',
    '[--control-glyph-on:var(--ids-color-text-tertiary)]',
  ),
  neutral: cn(
    '[--control-fill:var(--ids-color-on-surface)] [--control-on-fill:var(--ids-color-surface)]',
    fillStatesAwayFromText,
    '[--control-soft:var(--ids-color-bg-neutral-soft)] [--control-on-soft:var(--ids-color-text-on-neutral-soft)]',
    '[--control-soft-hover:var(--ids-color-bg-neutral-soft-hover)] [--control-soft-press:var(--ids-color-bg-neutral-soft-active)]',
    quietNeutral,
    '[--control-ring:var(--ids-color-border-primary)]',
    '[--control-glyph-on:var(--ids-color-on-surface)]',
  ),
  danger: cn(
    '[--control-fill:var(--ids-color-bg-danger)] [--control-on-fill:var(--ids-color-text-on-danger)]',
    '[--control-fill-hover:var(--ids-color-bg-danger-hover)] [--control-fill-press:var(--ids-color-bg-danger-active)]',
    '[--control-soft:var(--ids-color-bg-danger-soft)] [--control-on-soft:var(--ids-color-text-on-danger-soft)]',
    '[--control-soft-hover:var(--ids-color-bg-danger-soft-hover)] [--control-soft-press:var(--ids-color-bg-danger-soft-active)]',
    '[--control-quiet:var(--ids-color-text-danger)] [--control-on-press:var(--ids-color-text-on-danger-soft)]',
    '[--control-hover:var(--ids-color-bg-danger-soft)] [--control-press:var(--ids-color-bg-danger-soft-hover)]',
    '[--control-ring:var(--ids-color-border-danger)]',
    '[--control-glyph-on:var(--ids-color-text-danger)]',
  ),
  success: cn(
    '[--control-fill:var(--ids-color-bg-success)] [--control-on-fill:var(--ids-color-text-on-success)]',
    '[--control-fill-hover:var(--ids-color-bg-success-hover)] [--control-fill-press:var(--ids-color-bg-success-active)]',
    '[--control-soft:var(--ids-color-bg-success-soft)] [--control-on-soft:var(--ids-color-text-on-success-soft)]',
    '[--control-soft-hover:var(--ids-color-bg-success-soft-hover)] [--control-soft-press:var(--ids-color-bg-success-soft-active)]',
    '[--control-quiet:var(--ids-color-text-success)] [--control-on-press:var(--ids-color-text-on-success-soft)]',
    '[--control-hover:var(--ids-color-bg-success-soft)] [--control-press:var(--ids-color-bg-success-soft-hover)]',
    '[--control-ring:var(--ids-color-border-success)]',
    '[--control-glyph-on:var(--ids-color-text-success)]',
  ),
  warning: cn(
    '[--control-fill:var(--ids-color-bg-warning)] [--control-on-fill:var(--ids-color-text-on-warning)]',
    '[--control-fill-hover:var(--ids-color-bg-warning-hover)] [--control-fill-press:var(--ids-color-bg-warning-active)]',
    '[--control-soft:var(--ids-color-bg-warning-soft)] [--control-on-soft:var(--ids-color-text-on-warning-soft)]',
    '[--control-soft-hover:var(--ids-color-bg-warning-soft-hover)] [--control-soft-press:var(--ids-color-bg-warning-soft-active)]',
    '[--control-quiet:var(--ids-color-text-warning)] [--control-on-press:var(--ids-color-text-on-warning-soft)]',
    '[--control-hover:var(--ids-color-bg-warning-soft)] [--control-press:var(--ids-color-bg-warning-soft-hover)]',
    '[--control-ring:var(--ids-color-border-warning)]',
    '[--control-glyph-on:var(--ids-color-text-warning)]',
  ),
  info: cn(
    '[--control-fill:var(--ids-color-bg-info)] [--control-on-fill:var(--ids-color-text-on-info)]',
    '[--control-fill-hover:var(--ids-color-bg-info-hover)] [--control-fill-press:var(--ids-color-bg-info-active)]',
    '[--control-soft:var(--ids-color-bg-info-soft)] [--control-on-soft:var(--ids-color-text-on-info-soft)]',
    '[--control-soft-hover:var(--ids-color-bg-info-soft-hover)] [--control-soft-press:var(--ids-color-bg-info-soft-active)]',
    '[--control-quiet:var(--ids-color-text-info)] [--control-on-press:var(--ids-color-text-on-info-soft)]',
    '[--control-hover:var(--ids-color-bg-info-soft)] [--control-press:var(--ids-color-bg-info-soft-hover)]',
    '[--control-ring:var(--ids-color-border-info)]',
    '[--control-glyph-on:var(--ids-color-text-info)]',
  ),
} satisfies Record<ControlColorScheme, string>;

const fallbackScheme = schemes.primary;

const ringFollowsScheme = cn(
  'focus-visible:ring-(--control-ring)/40 data-focus-visible:ring-(--control-ring)/40',
  'focus-visible:inset-ring-(--control-ring) data-focus-visible:inset-ring-(--control-ring)',
);

const trimBesideIconOrSpinner = {
  standard: cn(
    'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-3',
    'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-3',
  ),
  tiny: cn(
    'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-2.5',
    'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-2.5',
  ),
} satisfies Record<IdsSize, string>;

export const controlSurface = {
  base: cn(
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap select-none touch-manipulation',
    'transition-[color,background-color,border-color,box-shadow] duration-(--ids-motion-fast)',
    'cursor-pointer data-disabled:not-aria-busy:cursor-not-allowed data-disabled:opacity-50',
    'aria-busy:cursor-progress',
    'focus-ring',
    ringFollowsScheme,
    'motion-reduce:transition-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    fallbackScheme,
  ),
  size: {
    standard: cn(
      'h-(--ids-size-control-standard) rounded-standard px-4 text-body-b3-medium',
      trimBesideIconOrSpinner.standard,
      "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
    ),
    tiny: cn(
      'h-(--ids-size-control-tiny) gap-1.5 rounded-standard px-3 text-caption-c1-medium',
      trimBesideIconOrSpinner.tiny,
      "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-tiny)",
    ),
  } satisfies Record<IdsSize, string>,
  variant: {
    solid: cn(
      'bg-(--control-fill) text-(--control-on-fill) shadow-xs',
      'data-hovered:bg-(--control-fill-hover) data-active:bg-(--control-fill-press)',
    ),
    soft: cn(
      'bg-(--control-soft) text-(--control-on-soft)',
      'data-hovered:bg-(--control-soft-hover) data-active:bg-(--control-soft-press)',
    ),
    outline: cn(
      'bg-surface text-(--control-quiet) shadow-xs',
      'inset-ring-1 inset-ring-neutral dark:bg-neutral-soft/30',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-press)',
    ),
    ghost: cn(
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-press)',
    ),
    glossy: cn(
      'bg-(--control-fill) text-(--control-on-fill) shadow-sm',
      'bg-linear-to-b from-white/20 to-transparent',
      'inset-shadow-[0_1px_0_rgb(255_255_255/0.35)]',
      'inset-ring-1 inset-ring-[color-mix(in_oklab,var(--control-fill),black_20%)]',
      'data-hovered:from-white/30',
      'data-active:from-transparent data-active:shadow-none data-active:inset-shadow-[0_1px_2px_rgb(0_0_0/0.2)]',
    ),
    transparent: cn(
      'bg-transparent text-(--control-quiet)',
      'transition-[color,background-color,border-color,box-shadow,opacity]',
      'data-hovered:opacity-70 data-active:opacity-40',
    ),
  } satisfies Record<IdsVariant, string>,
  colorScheme: schemes,
} as const;
