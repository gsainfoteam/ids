import { cn } from '../utils/cn';

import type { IdsSize, IdsVariant } from '../tokens/types';

export type ControlColorScheme = 'primary' | 'neutral' | 'danger' | 'success' | 'warning' | 'info';

const schemes = {
  primary: cn(
    '[--control-fill:var(--ids-color-primary)] [--control-on-fill:var(--ids-color-on-primary)]',
    '[--control-accent:var(--ids-color-primary)] [--control-quiet:var(--ids-color-on-surface)]',
    '[--control-hover:var(--ids-color-muted)] [--control-ring:var(--ids-color-primary)]',
  ),
  neutral: cn(
    '[--control-fill:var(--ids-color-on-surface)] [--control-on-fill:var(--ids-color-surface)]',
    '[--control-accent:var(--ids-color-on-surface)] [--control-quiet:var(--ids-color-on-surface)]',
    '[--control-hover:var(--ids-color-muted)] [--control-ring:var(--ids-color-primary)]',
  ),
  danger: cn(
    '[--control-fill:var(--ids-color-danger)] [--control-on-fill:var(--ids-color-on-danger)]',
    '[--control-accent:var(--ids-color-danger-strong)] [--control-quiet:var(--ids-color-danger-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-danger)_10%,transparent)] [--control-ring:var(--ids-color-danger)]',
  ),
  success: cn(
    '[--control-fill:var(--ids-color-success)] [--control-on-fill:var(--ids-color-on-success)]',
    '[--control-accent:var(--ids-color-success-strong)] [--control-quiet:var(--ids-color-success-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-success)_10%,transparent)] [--control-ring:var(--ids-color-success)]',
  ),
  warning: cn(
    '[--control-fill:var(--ids-color-warning)] [--control-on-fill:var(--ids-color-on-warning)]',
    '[--control-accent:var(--ids-color-warning-strong)] [--control-quiet:var(--ids-color-warning-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-warning)_10%,transparent)] [--control-ring:var(--ids-color-warning)]',
  ),
  info: cn(
    '[--control-fill:var(--ids-color-info)] [--control-on-fill:var(--ids-color-on-info)]',
    '[--control-accent:var(--ids-color-info-strong)] [--control-quiet:var(--ids-color-info-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-info)_10%,transparent)] [--control-ring:var(--ids-color-info)]',
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
      'data-hovered:bg-(--control-fill)/90 data-active:bg-(--control-fill)/80',
    ),
    soft: cn(
      'bg-(--control-fill)/10 text-(--control-accent)',
      'data-hovered:bg-(--control-fill)/15 data-active:bg-(--control-fill)/20',
    ),
    outline: cn(
      'bg-(--ids-color-surface) text-(--control-quiet) shadow-xs',
      'inset-ring-1 inset-ring-(--ids-color-border) dark:bg-(--ids-color-muted)/30',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-hover)',
    ),
    ghost: cn(
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-hover)',
    ),
  } satisfies Record<IdsVariant, string>,
  colorScheme: schemes,
} as const;
