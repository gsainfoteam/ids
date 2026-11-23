import { tv } from '../../../utils';

import type { GroupOrientation } from '.';

export const groupStyle = tv({
  slots: {
    root: [
      'relative flex w-fit items-stretch',
      '[&>:not(input,[popover],[data-floating-ui-focus-guard])]:relative',
      '[&>*]:data-hovered:z-10 [&>*]:data-active:z-20 [&>*]:focus-ring-visible:z-30',
      'has-[>[data-group]]:gap-2',
      'has-[>[data-variant=glossy]:not([aria-pressed],[aria-checked])]:rounded-standard',
      'has-[>[data-variant=glossy]:not([aria-pressed],[aria-checked])]:shadow-sm',
      '[&>[data-variant=glossy]:not([aria-pressed],[aria-checked])]:shadow-none',
    ],
    separator: 'relative z-25',
  },
  variants: {
    orientation: {
      horizontal: {
        root: [
          'flex-row',
          '[&>:not(input,[popover],[data-floating-ui-focus-guard])~:not(input,[popover],[data-floating-ui-focus-guard])]:rounded-s-none',
          '[&>:not(input,[popover],[data-floating-ui-focus-guard]):has(~:not(input,[popover],[data-floating-ui-focus-guard]))]:rounded-e-none',
          '[&>[data-variant=outline]+[data-variant=outline]]:-ms-px',
          '[&>[data-variant=outline]+[popover]+[data-variant=outline]]:-ms-px',
          '[&>[data-variant=glossy]+[data-variant=glossy]]:-ms-px',
          '[&>[data-variant=glossy]+[popover]+[data-variant=glossy]]:-ms-px',
        ],
        separator: '-mx-px',
      },
      vertical: {
        root: [
          'flex-col',
          '[&>:not(input,[popover],[data-floating-ui-focus-guard])~:not(input,[popover],[data-floating-ui-focus-guard])]:rounded-t-none',
          '[&>:not(input,[popover],[data-floating-ui-focus-guard]):has(~:not(input,[popover],[data-floating-ui-focus-guard]))]:rounded-b-none',
          '[&>[data-variant=outline]+[data-variant=outline]]:-mt-px',
          '[&>[data-variant=outline]+[popover]+[data-variant=outline]]:-mt-px',
          '[&>[data-variant=glossy]+[data-variant=glossy]]:-mt-px',
          '[&>[data-variant=glossy]+[popover]+[data-variant=glossy]]:-mt-px',
        ],
        separator: '-my-px',
      },
    } satisfies Record<GroupOrientation, object>,
  },
  defaultVariants: { orientation: 'horizontal' },
});
