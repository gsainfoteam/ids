import { brandFillStates } from './brand-fill';
import { cn } from '../utils/cn';

import type { IdsSize, IdsVariant } from '../tokens/types';

export type ControlColorScheme = 'primary' | 'neutral' | 'danger' | 'success' | 'warning' | 'info';

const schemes = {
  primary: cn(
    '[--control-fill:var(--ids-color-primary)] [--control-on-fill:var(--ids-color-on-primary)]',
    '[--control-soft:var(--ids-color-secondary)] [--control-on-soft:var(--ids-color-on-secondary)]',
    '[--control-quiet:var(--ids-color-on-surface)]',
    '[--control-hover:var(--ids-color-muted)] [--control-press:var(--ids-color-muted-hover)]',
    '[--control-ring:var(--ids-color-primary)]',
  ),
  neutral: cn(
    '[--control-fill:var(--ids-color-on-surface)] [--control-on-fill:var(--ids-color-surface)]',
    '[--control-soft:color-mix(in_oklab,var(--ids-color-on-surface)_10%,transparent)] [--control-on-soft:var(--ids-color-on-surface)]',
    '[--control-quiet:var(--ids-color-on-surface)]',
    '[--control-hover:var(--ids-color-muted)] [--control-press:var(--ids-color-muted-hover)]',
    '[--control-ring:var(--ids-color-primary)]',
  ),
  danger: cn(
    '[--control-fill:var(--ids-color-danger)] [--control-on-fill:var(--ids-color-on-danger)]',
    '[--control-soft:color-mix(in_oklab,var(--ids-color-danger)_10%,transparent)] [--control-on-soft:var(--ids-color-danger-strong)]',
    '[--control-quiet:var(--ids-color-danger-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-danger)_10%,transparent)]',
    '[--control-press:color-mix(in_oklab,var(--ids-color-danger)_16%,transparent)]',
    '[--control-ring:var(--ids-color-danger)]',
  ),
  success: cn(
    '[--control-fill:var(--ids-color-success)] [--control-on-fill:var(--ids-color-on-success)]',
    '[--control-soft:color-mix(in_oklab,var(--ids-color-success)_10%,transparent)] [--control-on-soft:var(--ids-color-success-strong)]',
    '[--control-quiet:var(--ids-color-success-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-success)_10%,transparent)]',
    '[--control-press:color-mix(in_oklab,var(--ids-color-success)_16%,transparent)]',
    '[--control-ring:var(--ids-color-success)]',
  ),
  warning: cn(
    '[--control-fill:var(--ids-color-warning)] [--control-on-fill:var(--ids-color-on-warning)]',
    '[--control-soft:color-mix(in_oklab,var(--ids-color-warning)_10%,transparent)] [--control-on-soft:var(--ids-color-warning-strong)]',
    '[--control-quiet:var(--ids-color-warning-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-warning)_10%,transparent)]',
    '[--control-press:color-mix(in_oklab,var(--ids-color-warning)_16%,transparent)]',
    '[--control-ring:var(--ids-color-warning)]',
  ),
  info: cn(
    '[--control-fill:var(--ids-color-info)] [--control-on-fill:var(--ids-color-on-info)]',
    '[--control-soft:color-mix(in_oklab,var(--ids-color-info)_10%,transparent)] [--control-on-soft:var(--ids-color-info-strong)]',
    '[--control-quiet:var(--ids-color-info-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-info)_10%,transparent)]',
    '[--control-press:color-mix(in_oklab,var(--ids-color-info)_16%,transparent)]',
    '[--control-ring:var(--ids-color-info)]',
  ),
} satisfies Record<ControlColorScheme, string>;

const fallbackScheme = schemes.primary;

const softTintsTowardFill = cn(
  '[--control-soft-hover:color-mix(in_oklab,var(--control-soft),var(--control-fill)_6%)]',
  '[--control-soft-press:color-mix(in_oklab,var(--control-soft),var(--control-fill)_12%)]',
);

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
    softTintsTowardFill,
  ),
  size: {
    standard: cn(
      'h-(--ids-size-control-standard) rounded-standard px-4 text-button-standard',
      trimBesideIconOrSpinner.standard,
      "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
    ),
    tiny: cn(
      'h-(--ids-size-control-tiny) gap-1.5 rounded-standard px-3 text-button-tiny',
      trimBesideIconOrSpinner.tiny,
      "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-tiny)",
    ),
  } satisfies Record<IdsSize, string>,
  variant: {
    solid: cn(
      'bg-(--control-fill) text-(--control-on-fill) shadow-xs',
      brandFillStates,
      'data-hovered:bg-(--control-fill-hover) data-active:bg-(--control-fill-press)',
    ),
    soft: cn(
      'bg-(--control-soft) text-(--control-on-soft)',
      'data-hovered:bg-(--control-soft-hover) data-active:bg-(--control-soft-press)',
    ),
    outline: cn(
      'bg-(--ids-color-surface) text-(--control-quiet) shadow-xs',
      'inset-ring-1 inset-ring-(--ids-color-border) dark:bg-(--ids-color-muted)/30',
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
  } satisfies Record<IdsVariant, string>,
  colorScheme: schemes,
} as const;
