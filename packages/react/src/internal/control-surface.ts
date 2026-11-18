import { IDS_STATUS_FAMILIES } from '../tokens/color-roles';
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

const schemes = {
  primary: cn('scheme-primary'),
  secondary: cn('scheme-secondary'),
  tertiary: cn('scheme-tertiary'),
  neutral: cn('scheme-neutral'),
  danger: cn('scheme-danger'),
  success: cn('scheme-success'),
  warning: cn('scheme-warning'),
  info: cn('scheme-info'),
} satisfies Record<ControlColorScheme, string>;

export const statusSchemes: ControlColorScheme[] = [...IDS_STATUS_FAMILIES];

export type ControlCompoundVariant<V extends IdsVariant = IdsVariant> = {
  colorScheme: ControlColorScheme | ControlColorScheme[];
  variant?: V | V[];
  class: string;
};

export const pressStates = cn('state-layer data-hovered:state-hover data-active:state-press');

export const quietInStatusColor = cn('text-scheme state-scheme');

export const neutralKeepsThePrimaryRing: ControlCompoundVariant<never> = {
  colorScheme: 'neutral',
  class: cn('focus-ring'),
};

const compoundVariants: ControlCompoundVariant[] = [
  neutralKeepsThePrimaryRing,
  { colorScheme: statusSchemes, variant: ['outline', 'ghost'], class: quietInStatusColor },
  { colorScheme: statusSchemes, variant: 'transparent', class: cn('text-scheme') },
];

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
    'focus-ring-scheme',
    'motion-reduce:transition-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
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
    solid: cn('bg-scheme text-on-scheme shadow-xs', pressStates, 'state-fill'),
    soft: cn('bg-scheme-subtle text-on-scheme-subtle', pressStates, 'state-scheme'),
    outline: cn(
      'bg-neutral-subtlest text-neutral-bold shadow-xs',
      'inset-ring-1 inset-ring-neutral',
      'dark:bg-neutral-subtle dark:inset-ring-(--ids-color-bg-neutral)',
      pressStates,
    ),
    ghost: cn('bg-transparent text-neutral-bold', pressStates),
    glossy: cn(
      'bg-scheme text-on-scheme shadow-sm',
      'bg-linear-to-b from-white/20 to-transparent',
      'inset-shadow-[0_1px_0_rgb(255_255_255/0.35)]',
      'inset-ring-1 inset-ring-black/20',
      'data-hovered:from-white/30',
      'data-active:from-transparent data-active:shadow-none data-active:inset-shadow-[0_1px_2px_rgb(0_0_0/0.2)]',
    ),
    transparent: cn(
      'bg-transparent text-neutral-bold',
      'transition-[color,background-color,border-color,box-shadow,opacity]',
      'data-hovered:opacity-70 data-active:opacity-40',
    ),
  } satisfies Record<IdsVariant, string>,
  colorScheme: schemes,
  compoundVariants,
} as const;
