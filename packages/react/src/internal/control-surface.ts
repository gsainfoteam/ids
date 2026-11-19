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

const softLayerInFamilyColor = cn(
  '[--control-soft-layer:var(--control-fill)]',
  '[--control-soft-hover:var(--ids-state-tint-hover)] [--control-soft-press:var(--ids-state-tint-press)]',
);

const softLayerInTextColor = cn(
  '[--control-soft-layer:currentColor]',
  '[--control-soft-hover:var(--ids-state-hover)] [--control-soft-press:var(--ids-state-press)]',
);

const quietLayerInFamilyColor = cn(
  '[--control-quiet-layer:var(--control-fill)]',
  '[--control-quiet-hover:var(--ids-state-tint-hover)] [--control-quiet-press:var(--ids-state-tint-press)]',
);

const quietLayerInTextColor = cn(
  '[--control-quiet-layer:currentColor]',
  '[--control-quiet-hover:var(--ids-state-hover)] [--control-quiet-press:var(--ids-state-press)]',
);

const schemes = {
  primary: cn(
    '[--control-fill:var(--ids-color-bg-primary)] [--control-on-fill:var(--ids-color-text-on-primary)]',
    '[--control-soft:var(--ids-color-bg-primary-subtle)] [--control-on-soft:var(--ids-color-text-on-primary-subtle)]',
    '[--control-quiet:var(--ids-color-text-neutral-bold)]',
    '[--control-ring:var(--ids-color-border-primary)]',
    '[--control-glyph-on:var(--ids-color-text-primary)]',
    softLayerInFamilyColor,
    quietLayerInTextColor,
  ),
  secondary: cn(
    '[--control-fill:var(--ids-color-bg-secondary)] [--control-on-fill:var(--ids-color-text-on-secondary)]',
    '[--control-soft:var(--ids-color-bg-secondary-subtle)] [--control-on-soft:var(--ids-color-text-on-secondary-subtle)]',
    '[--control-quiet:var(--ids-color-text-neutral-bold)]',
    '[--control-ring:var(--ids-color-border-secondary)]',
    '[--control-glyph-on:var(--ids-color-text-secondary)]',
    softLayerInFamilyColor,
    quietLayerInTextColor,
  ),
  tertiary: cn(
    '[--control-fill:var(--ids-color-bg-tertiary)] [--control-on-fill:var(--ids-color-text-on-tertiary)]',
    '[--control-soft:var(--ids-color-bg-tertiary-subtle)] [--control-on-soft:var(--ids-color-text-on-tertiary-subtle)]',
    '[--control-quiet:var(--ids-color-text-neutral-bold)]',
    '[--control-ring:var(--ids-color-border-tertiary)]',
    '[--control-glyph-on:var(--ids-color-text-tertiary)]',
    softLayerInFamilyColor,
    quietLayerInTextColor,
  ),
  neutral: cn(
    '[--control-fill:var(--ids-color-bg-neutral-bold)] [--control-on-fill:var(--ids-color-text-on-neutral-bold)]',
    '[--control-soft:var(--ids-color-bg-neutral-subtle)] [--control-on-soft:var(--ids-color-text-on-neutral-subtle)]',
    '[--control-quiet:var(--ids-color-text-neutral-bold)]',
    '[--control-ring:var(--ids-color-border-primary)]',
    '[--control-glyph-on:var(--ids-color-text-neutral-bold)]',
    softLayerInTextColor,
    quietLayerInTextColor,
  ),
  danger: cn(
    '[--control-fill:var(--ids-color-bg-danger)] [--control-on-fill:var(--ids-color-text-on-danger)]',
    '[--control-soft:var(--ids-color-bg-danger-subtle)] [--control-on-soft:var(--ids-color-text-on-danger-subtle)]',
    '[--control-quiet:var(--ids-color-text-danger)]',
    '[--control-ring:var(--ids-color-border-danger)]',
    '[--control-glyph-on:var(--ids-color-text-danger)]',
    softLayerInFamilyColor,
    quietLayerInFamilyColor,
  ),
  success: cn(
    '[--control-fill:var(--ids-color-bg-success)] [--control-on-fill:var(--ids-color-text-on-success)]',
    '[--control-soft:var(--ids-color-bg-success-subtle)] [--control-on-soft:var(--ids-color-text-on-success-subtle)]',
    '[--control-quiet:var(--ids-color-text-success)]',
    '[--control-ring:var(--ids-color-border-success)]',
    '[--control-glyph-on:var(--ids-color-text-success)]',
    softLayerInFamilyColor,
    quietLayerInFamilyColor,
  ),
  warning: cn(
    '[--control-fill:var(--ids-color-bg-warning)] [--control-on-fill:var(--ids-color-text-on-warning)]',
    '[--control-soft:var(--ids-color-bg-warning-subtle)] [--control-on-soft:var(--ids-color-text-on-warning-subtle)]',
    '[--control-quiet:var(--ids-color-text-warning)]',
    '[--control-ring:var(--ids-color-border-warning)]',
    '[--control-glyph-on:var(--ids-color-text-warning)]',
    softLayerInFamilyColor,
    quietLayerInFamilyColor,
  ),
  info: cn(
    '[--control-fill:var(--ids-color-bg-info)] [--control-on-fill:var(--ids-color-text-on-info)]',
    '[--control-soft:var(--ids-color-bg-info-subtle)] [--control-on-soft:var(--ids-color-text-on-info-subtle)]',
    '[--control-quiet:var(--ids-color-text-info)]',
    '[--control-ring:var(--ids-color-border-info)]',
    '[--control-glyph-on:var(--ids-color-text-info)]',
    softLayerInFamilyColor,
    quietLayerInFamilyColor,
  ),
} satisfies Record<ControlColorScheme, string>;

const fallbackScheme = schemes.primary;

const ringFollowsScheme = cn(
  'focus-visible:ring-(--control-ring)/40 data-focus-visible:ring-(--control-ring)/40',
  'focus-visible:inset-ring-(--control-ring) data-focus-visible:inset-ring-(--control-ring)',
);

export const pressStates = cn('state-layer data-hovered:state-hover data-active:state-press');

export const drawsSoftLayer = cn(
  '[--ids-state-color:var(--control-soft-layer)]',
  '[--ids-state-layer-hover:var(--control-soft-hover)] [--ids-state-layer-press:var(--control-soft-press)]',
);

export const drawsQuietLayer = cn(
  '[--ids-state-color:var(--control-quiet-layer)]',
  '[--ids-state-layer-hover:var(--control-quiet-hover)] [--ids-state-layer-press:var(--control-quiet-press)]',
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
    'transition-[color,background-color,border-color,box-shadow,--ids-state-opacity] duration-(--ids-motion-fast)',
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
    solid: cn('bg-(--control-fill) text-(--control-on-fill) shadow-xs', pressStates, 'state-fill'),
    soft: cn('bg-(--control-soft) text-(--control-on-soft)', pressStates, drawsSoftLayer),
    outline: cn(
      'bg-neutral-subtlest text-(--control-quiet) shadow-xs',
      'inset-ring-1 inset-ring-neutral',
      'dark:bg-neutral-subtle dark:inset-ring-(--ids-color-bg-neutral)',
      pressStates,
      drawsQuietLayer,
    ),
    ghost: cn('bg-transparent text-(--control-quiet)', pressStates, drawsQuietLayer),
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
