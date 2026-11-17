import { tv } from '../../../utils';

import type { GroupLayout, GroupOrientation } from '.';
import type { IdsSize } from '../../../tokens/types';

const joinedLayouts = ['attached', 'framed'] satisfies GroupLayout[];
const shortSeamLayouts = ['tray', 'framed'] satisfies GroupLayout[];

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
    layout: {
      attached: {
        root: [
          'has-[>[data-variant=glossy]:not([aria-pressed],[aria-checked])]:rounded-standard',
          'has-[>[data-variant=glossy]:not([aria-pressed],[aria-checked])]:shadow-sm',
          '[&>[data-variant=glossy]:not([aria-pressed],[aria-checked])]:shadow-none',
        ],
      },
      spaced: { root: 'gap-2' },
      tray: { root: 'gap-1 border border-neutral bg-surface shadow-xs concentric-p-1' },
      framed: {
        root: [
          'rounded-standard bg-surface shadow-xs dark:bg-neutral-soft/30',
          'after:pointer-events-none after:absolute after:inset-0 after:z-25 after:rounded-[inherit]',
          'after:inset-ring-1 after:inset-ring-neutral',
        ],
      },
    } satisfies Record<GroupLayout, object>,
    size: { standard: {}, tiny: {} } satisfies Record<IdsSize, object>,
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      layout: joinedLayouts,
      class: {
        root: [
          '[&>:not(input,[popover],[data-floating-ui-focus-guard])~:not(input,[popover],[data-floating-ui-focus-guard])]:rounded-s-none',
          '[&>:not(input,[popover],[data-floating-ui-focus-guard]):has(~:not(input,[popover],[data-floating-ui-focus-guard]))]:rounded-e-none',
        ],
      },
    },
    {
      orientation: 'vertical',
      layout: joinedLayouts,
      class: {
        root: [
          '[&>:not(input,[popover],[data-floating-ui-focus-guard])~:not(input,[popover],[data-floating-ui-focus-guard])]:rounded-t-none',
          '[&>:not(input,[popover],[data-floating-ui-focus-guard]):has(~:not(input,[popover],[data-floating-ui-focus-guard]))]:rounded-b-none',
        ],
      },
    },
    {
      orientation: 'horizontal',
      layout: 'attached',
      class: {
        root: [
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
      layout: 'attached',
      class: {
        root: [
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
      layout: shortSeamLayouts,
      class: { separator: 'h-5 min-h-0 self-center' },
    },
    {
      orientation: 'vertical',
      layout: shortSeamLayouts,
      class: { separator: 'w-5 self-center' },
    },
    { orientation: 'horizontal', layout: 'tray', class: { separator: 'mx-1' } },
    { orientation: 'vertical', layout: 'tray', class: { separator: 'my-1' } },
    {
      orientation: 'horizontal',
      layout: shortSeamLayouts,
      size: 'tiny',
      class: { separator: 'h-4' },
    },
    {
      orientation: 'vertical',
      layout: shortSeamLayouts,
      size: 'tiny',
      class: { separator: 'w-4' },
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    layout: 'attached',
    size: 'standard',
  },
});
