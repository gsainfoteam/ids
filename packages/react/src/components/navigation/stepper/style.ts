import { tv } from '../../../utils';

import type { StepperOrientation } from './root';
import type { IdsSize } from '../../../tokens/types';

export const stepPartsStyle = tv({
  slots: {
    root: 'flex w-full flex-col gap-6',
    list: 'flex w-full',
    item: 'flex min-w-0',
    trigger: [
      'group/stepper-trigger grid min-w-0 grid-cols-[auto_minmax(0,1fr)] rounded-standard text-start',
      'text-neutral-strong focus-ring',
      'data-disabled:opacity-50',
    ],
    indicator: [
      'group-has-[[data-stepper-description]]/stepper-trigger:row-span-2',
      'inline-flex shrink-0 items-center justify-center rounded-full tabular-nums',
      'bg-neutral-soft text-neutral',
      'data-completed:bg-primary-solid data-completed:text-on-primary-solid data-completed:state-fill',
      'data-current:bg-primary-solid data-current:text-on-primary-solid',
      'data-current:ring-4 data-current:ring-(--ids-color-bg-primary-soft)',
      'data-error:bg-danger-soft data-error:text-on-danger-soft',
      'data-neutral:empty:bg-transparent data-neutral:empty:before:size-2.5',
      'data-neutral:empty:before:rounded-full data-neutral:empty:before:bg-current',
      'transition-[background-color,box-shadow,--ids-state-opacity] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'state-layer not-data-current:group-data-hovered/stepper-trigger:state-hover',
      'not-data-current:group-data-active/stepper-trigger:state-press',
    ],
    title: [
      'col-start-2 self-center text-neutral-strong',
      'data-upcoming:text-neutral data-error:text-danger',
      'underline-offset-4 group-data-hovered/stepper-trigger:underline',
    ],
    description: 'col-start-2 text-neutral',
    body: 'min-w-0 text-neutral-strong',
    status: 'sr-only',
    separator: [
      'shrink-0 bg-(--ids-color-border-neutral)',
      'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
    ],
    content: 'text-neutral-strong',
  },
  variants: {
    orientation: {
      horizontal: {
        list: 'flex-row items-center gap-3',
        item: 'flex-1 items-center gap-3 last:flex-none',
        trigger: 'items-center',
        body: 'hidden',
        separator: 'h-px min-w-4 flex-1',
      },
      vertical: {
        list: 'flex-col',
        item: 'relative flex-col pb-6 last:pb-0',
        trigger: 'items-start',
        indicator: 'self-start',
        title: 'flex items-center',
        body: 'mt-2',
        separator: 'absolute bottom-1 min-h-0 w-px',
      },
    } satisfies Record<StepperOrientation, object>,
    size: {
      standard: {
        trigger: 'gap-x-3',
        indicator: 'size-8 text-body-b3-medium [&_svg]:size-4',
        title: 'text-body-b3-medium',
        description: 'text-body-b3-regular',
        body: 'text-body-b3-regular',
      },
      tiny: {
        trigger: 'gap-x-2',
        indicator: 'size-6 text-caption-c1-medium [&_svg]:size-3.5',
        title: 'text-caption-c1-medium',
        description: 'text-caption-c1-regular',
        body: 'text-caption-c1-regular',
      },
    } satisfies Record<IdsSize, object>,
  },
  compoundVariants: [
    {
      orientation: 'vertical',
      size: 'standard',
      class: {
        title: 'py-[calc((--spacing(8)-1lh)/2)]',
        separator: 'start-[calc(--spacing(4)-0.5px)] top-10',
        body: 'ms-11',
      },
    },
    {
      orientation: 'vertical',
      size: 'tiny',
      class: {
        title: 'py-[calc((--spacing(6)-1lh)/2)]',
        separator: 'start-[calc(--spacing(3)-0.5px)] top-8',
        body: 'ms-8',
      },
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    size: 'standard',
  },
});

export const stepperStyle = tv({
  extend: stepPartsStyle,
  slots: {
    trigger: '',
    separator: 'data-completed:bg-primary-solid',
  },
  variants: {
    interactive: {
      true: {
        trigger: 'cursor-pointer disabled:cursor-default data-disabled:cursor-not-allowed',
      },
      false: {},
    },
  },
  defaultVariants: {
    interactive: false,
  },
});
