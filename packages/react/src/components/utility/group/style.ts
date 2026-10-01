import { tv } from '../../../utils';

import type { GroupOrientation } from '.';
import type { IdsSize } from '../../../tokens/types';

export const groupStyle = tv({
  slots: {
    root: [
      'relative flex w-fit items-stretch',
      '[&>:not(input,[popover],[data-floating-ui-focus-guard])]:relative',
      '[&>[data-hovered]]:z-10 [&>[data-active]]:z-20 [&>[data-focus-visible]]:z-30',
      'has-[>[data-group]]:gap-2',
    ],
    separator: 'relative z-25',
    text: [
      'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-standard shadow-xs',
      'bg-(--ids-color-muted) text-(--ids-color-on-surface)',
      'inset-ring-1 inset-ring-(--ids-color-border)',
      '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    ],
  },
  variants: {
    orientation: {
      horizontal: { root: 'flex-row' },
      vertical: { root: 'flex-col' },
    } satisfies Record<GroupOrientation, object>,
    attached: {
      true: {
        root: [
          'has-[>[data-variant=glossy]:not([aria-pressed],[aria-checked])]:rounded-standard',
          'has-[>[data-variant=glossy]:not([aria-pressed],[aria-checked])]:shadow-sm',
          '[&>[data-variant=glossy]:not([aria-pressed],[aria-checked])]:shadow-none',
        ],
      },
      false: { root: 'gap-2' },
    },
    size: {
      standard: {
        text: "px-4 text-button-standard [&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
      },
      tiny: {
        text: "px-3 text-button-tiny [&_svg:not([class*='size-'])]:size-(--ids-size-icon-tiny)",
      },
    } satisfies Record<IdsSize, object>,
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      attached: true,
      class: {
        root: [
          '[&>:not(input,[popover],[data-floating-ui-focus-guard])~:not(input,[popover],[data-floating-ui-focus-guard])]:rounded-s-none',
          '[&>:not(input,[popover],[data-floating-ui-focus-guard]):has(~:not(input,[popover],[data-floating-ui-focus-guard]))]:rounded-e-none',
          '[&>[data-variant=outline]+[data-variant=outline]]:-ms-px',
          '[&>[data-variant=outline]+[popover]+[data-variant=outline]]:-ms-px',
          '[&>[data-variant=glossy]+[data-variant=glossy]]:-ms-px',
          '[&>[data-variant=glossy]+[popover]+[data-variant=glossy]]:-ms-px',
        ],
        separator: '-mx-px',
      },
    },
    {
      orientation: 'vertical',
      attached: true,
      class: {
        root: [
          '[&>:not(input,[popover],[data-floating-ui-focus-guard])~:not(input,[popover],[data-floating-ui-focus-guard])]:rounded-t-none',
          '[&>:not(input,[popover],[data-floating-ui-focus-guard]):has(~:not(input,[popover],[data-floating-ui-focus-guard]))]:rounded-b-none',
          '[&>[data-variant=outline]+[data-variant=outline]]:-mt-px',
          '[&>[data-variant=outline]+[popover]+[data-variant=outline]]:-mt-px',
          '[&>[data-variant=glossy]+[data-variant=glossy]]:-mt-px',
          '[&>[data-variant=glossy]+[popover]+[data-variant=glossy]]:-mt-px',
        ],
        separator: '-my-px',
      },
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    attached: true,
    size: 'standard',
  },
});
