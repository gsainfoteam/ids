import { cn, tv } from '../../utils';
import { fieldAction, fieldSurface, type FieldSurfaceVariant } from '../field-surface';

import type { IdsSize } from '../../tokens/types';

export const insetButtons = {
  base: cn(
    '[&_button]:w-auto [&_button]:gap-1 [&_button]:px-1 [&_button:not([aria-label])]:px-2.5',
  ),
  size: {
    standard: cn('[&_button]:h-7 [&_button]:min-w-7'),
    tiny: cn('[&_button]:h-6 [&_button]:min-w-6 [&_button:not([aria-label])]:px-2'),
  } satisfies Record<IdsSize, string>,
} as const;

export const textControlStyle = tv({
  slots: {
    root: ['inline-flex w-full min-w-0 cursor-text items-center', fieldSurface.base],
    input: [
      'h-full w-full min-w-0 flex-1 bg-transparent outline-none',
      'text-inherit placeholder:text-(--ids-color-on-muted)',
      'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
      'disabled:cursor-not-allowed',
      '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
      '[&::-ms-clear]:hidden [&::-ms-reveal]:hidden',
    ],
    adornment: [
      'inline-flex shrink-0 items-center empty:hidden',
      'text-(--ids-color-on-muted) [&_svg]:shrink-0',
      insetButtons.base,
    ],
    action: fieldAction.base,
  },
  variants: {
    variant: {
      outline: { root: fieldSurface.variant.outline },
      soft: { root: fieldSurface.variant.soft },
      ghost: { root: fieldSurface.variant.ghost },
    } satisfies Record<FieldSurfaceVariant, object>,
    size: {
      standard: {
        root: fieldSurface.size.standard,
        adornment: [
          "gap-1 text-body-b3-regular [&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
          insetButtons.size.standard,
          'has-[button]:first:-ms-2 has-[button]:last:-me-2',
        ],
        action: fieldAction.padded.standard,
      },
      tiny: {
        root: fieldSurface.size.tiny,
        adornment: [
          "gap-0.5 text-caption-c1-regular [&_svg:not([class*='size-'])]:size-(--ids-size-icon-tiny)",
          insetButtons.size.tiny,
          'has-[button]:first:-ms-1.5 has-[button]:last:-me-1.5',
        ],
        action: fieldAction.padded.tiny,
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
