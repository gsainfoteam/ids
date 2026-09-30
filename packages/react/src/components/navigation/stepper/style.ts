import { primaryFill } from '../../../internal/brand-fill';
import { tv } from '../../../utils';

import type { StepperOrientation } from './root';
import type { IdsSize } from '../../../tokens/types';

export const stepperStyle = tv({
  slots: {
    root: ['flex w-full flex-col gap-6', primaryFill],
    list: 'flex w-full',
    item: 'flex min-w-0',
    trigger: [
      'group/stepper-trigger grid min-w-0 grid-cols-[auto_minmax(0,1fr)] rounded-standard text-start',
      'text-(--ids-color-on-surface) focus-ring',
      'data-disabled:opacity-50',
    ],
    indicator: [
      'group-has-[[data-stepper-description]]/stepper-trigger:row-span-2',
      'inline-flex shrink-0 items-center justify-center rounded-full tabular-nums',
      'bg-(--ids-color-muted) text-(--ids-color-on-muted)',
      'data-completed:bg-(--control-fill) data-completed:text-(--control-on-fill)',
      'data-current:bg-(--control-fill) data-current:text-(--control-on-fill)',
      'data-current:ring-4 data-current:ring-(--ids-color-secondary)',
      'data-error:bg-(--ids-color-danger)/10 data-error:text-(--ids-color-danger-strong)',
      'transition-[background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'group-data-hovered/stepper-trigger:data-upcoming:bg-(--ids-color-muted-hover)',
      'group-data-active/stepper-trigger:data-upcoming:bg-(--ids-color-muted-active)',
      'group-data-hovered/stepper-trigger:data-completed:bg-(--control-fill-hover)',
      'group-data-active/stepper-trigger:data-completed:bg-(--control-fill-press)',
      'group-data-hovered/stepper-trigger:data-error:bg-(--ids-color-danger)/15',
      'group-data-active/stepper-trigger:data-error:bg-(--ids-color-danger)/20',
    ],
    title: [
      'col-start-2 self-center text-(--ids-color-on-surface)',
      'data-upcoming:text-(--ids-color-on-muted) data-error:text-(--ids-color-danger-strong)',
      'underline-offset-4 group-data-hovered/stepper-trigger:underline',
    ],
    description: 'col-start-2 text-(--ids-color-on-muted)',
    status: 'sr-only',
    separator: [
      'shrink-0 bg-(--ids-color-border) data-completed:bg-(--ids-color-primary)',
      'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
    ],
    content: 'text-(--ids-color-on-surface)',
  },
  variants: {
    orientation: {
      horizontal: {
        list: 'flex-row items-center gap-3',
        item: 'flex-1 items-center gap-3 last:flex-none',
        trigger: 'items-center',
        separator: 'h-px min-w-4 flex-1',
      },
      vertical: {
        list: 'flex-col',
        item: 'relative flex-col pb-6 last:pb-0',
        trigger: 'items-start',
        indicator: 'self-start',
        title: 'flex items-center',
        separator: 'absolute bottom-1 w-px',
      },
    } satisfies Record<StepperOrientation, object>,
    size: {
      standard: {
        trigger: 'gap-x-3',
        indicator: 'size-8 text-body-b3-medium [&_svg]:size-4',
        title: 'text-body-b3-medium',
        description: 'text-body-b3-regular',
      },
      tiny: {
        trigger: 'gap-x-2',
        indicator: 'size-6 text-caption-c1-medium [&_svg]:size-3.5',
        title: 'text-caption-c1-medium',
        description: 'text-caption-c1-regular',
      },
    } satisfies Record<IdsSize, object>,
    interactive: {
      true: {
        trigger: 'cursor-pointer disabled:cursor-default data-disabled:cursor-not-allowed',
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      orientation: 'vertical',
      size: 'standard',
      class: {
        title: 'py-[calc((--spacing(8)-1lh)/2)]',
        separator: 'start-[calc(1rem-0.5px)] top-10',
      },
    },
    {
      orientation: 'vertical',
      size: 'tiny',
      class: {
        title: 'py-[calc((--spacing(6)-1lh)/2)]',
        separator: 'start-[calc(0.75rem-0.5px)] top-8',
      },
    },
  ],
  defaultVariants: { orientation: 'horizontal', size: 'standard', interactive: false },
});
