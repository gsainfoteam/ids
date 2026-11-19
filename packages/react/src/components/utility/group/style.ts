import { tv } from '../../../utils';

import type { GroupOrientation } from '.';
import type { IdsSize } from '../../../tokens/types';

export const groupStyle = tv({
  slots: {
    root: [
      'relative flex w-fit items-stretch',
      '[&>:not(input,[popover],[data-floating-ui-focus-guard])]:relative',
      '[&>*]:data-hovered:z-10 [&>*]:data-active:z-20 [&>*]:focus-ring-visible:z-30',
      'has-[>[data-group]]:gap-2',
    ],
    separator: 'relative z-25',
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
    size: { standard: {}, tiny: {} } satisfies Record<IdsSize, object>,
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
    {
      orientation: 'horizontal',
      attached: false,
      class: { separator: 'h-5 min-h-0 self-center' },
    },
    {
      orientation: 'vertical',
      attached: false,
      class: { separator: 'w-5 self-center' },
    },
    { orientation: 'horizontal', attached: false, size: 'tiny', class: { separator: 'h-4' } },
    { orientation: 'vertical', attached: false, size: 'tiny', class: { separator: 'w-4' } },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    attached: true,
    size: 'standard',
  },
});
