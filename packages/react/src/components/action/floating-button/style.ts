import {
  controlSurface,
  neutralKeepsThePrimaryRing,
  pressStates,
  statusSchemes,
} from '../../../internal/control-surface';
import { cn, tv } from '../../../utils';

import type { FloatingButton } from '.';
import type { IdsSize } from '../../../tokens/types';

const opaqueFills = {
  solid: cn(controlSurface.variant.solid, 'shadow-lg'),
  soft: cn(controlSurface.variant.soft),
  outline: cn(
    'bg-neutral-subtlest text-neutral-bold inset-ring-1 inset-ring-neutral',
    pressStates,
  ),
  glossy: cn(controlSurface.variant.glossy, 'shadow-lg data-active:shadow-lg'),
} satisfies Record<FloatingButton.Variant, string>;

export const floatingButtonStyle = tv({
  base: [
    controlSurface.base,
    'fixed z-40 max-w-[calc(100vw-var(--spacing)*12)] shadow-lg data-hovered:shadow-xl print:hidden',
    'transition-[color,background-color,box-shadow,scale,--ids-state-opacity] motion-safe:data-active:scale-95',
  ],
  variants: {
    variant: opaqueFills,
    colorScheme: controlSurface.colorScheme,
    size: {
      standard: ['text-body-b3-medium', "[&_svg:not([class*='size-'])]:size-6"],
      tiny: ['text-caption-c1-medium', "[&_svg:not([class*='size-'])]:size-5"],
    } satisfies Record<IdsSize, string[]>,
    iconOnly: {
      true: 'aspect-square rounded-full p-0',
      false: 'rounded-standard',
    },
    placement: {
      'top-left': [
        'top-[calc(--spacing(6)+env(safe-area-inset-top))]',
        'ltr:left-[calc(--spacing(6)+env(safe-area-inset-left))] rtl:right-[calc(--spacing(6)+env(safe-area-inset-right))]',
      ],
      'top-right': [
        'top-[calc(--spacing(6)+env(safe-area-inset-top))]',
        'ltr:right-[calc(--spacing(6)+env(safe-area-inset-right))] rtl:left-[calc(--spacing(6)+env(safe-area-inset-left))]',
      ],
      'bottom-left': [
        'bottom-[calc(--spacing(6)+env(safe-area-inset-bottom))]',
        'ltr:left-[calc(--spacing(6)+env(safe-area-inset-left))] rtl:right-[calc(--spacing(6)+env(safe-area-inset-right))]',
      ],
      'bottom-right': [
        'bottom-[calc(--spacing(6)+env(safe-area-inset-bottom))]',
        'ltr:right-[calc(--spacing(6)+env(safe-area-inset-right))] rtl:left-[calc(--spacing(6)+env(safe-area-inset-left))]',
      ],
    } satisfies Record<FloatingButton.Placement, string[]>,
  },
  compoundVariants: [
    neutralKeepsThePrimaryRing,
    { colorScheme: statusSchemes, variant: 'outline', class: 'text-scheme' },
    { size: 'standard', iconOnly: true, class: 'size-14' },
    { size: 'tiny', iconOnly: true, class: 'size-11' },
    {
      size: 'standard',
      iconOnly: false,
      class: [
        'h-14 gap-2 px-5',
        'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-4',
        'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-4',
      ],
    },
    {
      size: 'tiny',
      iconOnly: false,
      class: [
        'h-11 gap-1.5 px-4',
        'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-3',
        'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-3',
      ],
    },
  ],
  defaultVariants: {
    variant: 'solid',
    colorScheme: 'primary',
    size: 'standard',
    iconOnly: false,
    placement: 'bottom-right',
  },
});
