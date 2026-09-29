import { controlSurface } from '../../../internal/control-surface';
import { cn, tv } from '../../../utils';

import type { FloatingButton } from '.';
import type { IdsSize } from '../../../tokens/types';

const opaqueFills = {
  solid: cn(
    'bg-(--control-fill) text-(--control-on-fill)',
    'data-hovered:bg-[color-mix(in_oklab,var(--control-fill)_90%,var(--ids-color-surface))]',
    'data-active:bg-[color-mix(in_oklab,var(--control-fill)_80%,var(--ids-color-surface))]',
  ),
  soft: cn(
    'bg-(--ids-color-surface) text-(--control-on-soft)',
    'bg-[image:linear-gradient(var(--control-soft),var(--control-soft))]',
    'data-hovered:bg-[image:linear-gradient(var(--control-soft-hover),var(--control-soft-hover))]',
    'data-active:bg-[image:linear-gradient(var(--control-soft-press),var(--control-soft-press))]',
  ),
  outline: cn(
    'bg-(--ids-color-surface) text-(--control-quiet) inset-ring-1 inset-ring-(--ids-color-border)',
    'data-hovered:bg-(--ids-color-muted) data-active:bg-(--ids-color-muted-hover)',
  ),
  glossy: cn(
    'bg-(--control-fill) text-(--control-on-fill)',
    'bg-linear-to-b from-white/20 to-transparent',
    'inset-shadow-[0_1px_0_rgb(255_255_255/0.35)]',
    'inset-ring-1 inset-ring-[color-mix(in_oklab,var(--control-fill),black_20%)]',
    'data-hovered:from-white/30',
    'data-active:from-transparent data-active:inset-shadow-[0_1px_2px_rgb(0_0_0/0.2)]',
  ),
} satisfies Record<FloatingButton.Variant, string>;

export const floatingButtonStyle = tv({
  base: [
    controlSurface.base,
    'fixed z-40 max-w-[calc(100vw-3rem)] shadow-lg data-hovered:shadow-xl print:hidden',
    'transition-[color,background-color,box-shadow,scale] motion-safe:data-active:scale-95',
  ],
  variants: {
    variant: opaqueFills,
    colorScheme: controlSurface.colorScheme,
    size: {
      standard: ['text-button-standard', "[&_svg:not([class*='size-'])]:size-6"],
      tiny: ['text-button-tiny', "[&_svg:not([class*='size-'])]:size-5"],
    } satisfies Record<IdsSize, string[]>,
    iconOnly: {
      true: 'aspect-square rounded-full p-0',
      false: 'rounded-standard',
    },
    placement: {
      'top-left': [
        'top-[calc(1.5rem+env(safe-area-inset-top))]',
        'ltr:left-[calc(1.5rem+env(safe-area-inset-left))] rtl:right-[calc(1.5rem+env(safe-area-inset-right))]',
      ],
      'top-right': [
        'top-[calc(1.5rem+env(safe-area-inset-top))]',
        'ltr:right-[calc(1.5rem+env(safe-area-inset-right))] rtl:left-[calc(1.5rem+env(safe-area-inset-left))]',
      ],
      'bottom-left': [
        'bottom-[calc(1.5rem+env(safe-area-inset-bottom))]',
        'ltr:left-[calc(1.5rem+env(safe-area-inset-left))] rtl:right-[calc(1.5rem+env(safe-area-inset-right))]',
      ],
      'bottom-right': [
        'bottom-[calc(1.5rem+env(safe-area-inset-bottom))]',
        'ltr:right-[calc(1.5rem+env(safe-area-inset-right))] rtl:left-[calc(1.5rem+env(safe-area-inset-left))]',
      ],
    } satisfies Record<FloatingButton.Placement, string[]>,
  },
  compoundVariants: [
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
