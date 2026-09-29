import { tv } from '../../../utils';

import type { AccordionVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const accordionStyle = tv({
  slots: {
    root: 'flex w-full flex-col',
    item: '',
    heading: 'flex',
    trigger: [
      'flex w-full flex-1 cursor-pointer items-start gap-2 rounded-standard text-start',
      'text-(--ids-color-on-surface) focus-ring',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
      'motion-reduce:transition-none',
      'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-default',
    ],
    indicator: [
      'pointer-events-none inline-flex h-[1lh] shrink-0 items-center',
      'text-(--ids-color-on-muted) [&_svg]:size-4',
      'transition-transform duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
      'data-open:rotate-180',
    ],
    content: [
      'grid grid-rows-[0fr] transition-[grid-template-rows] duration-(--ids-motion-normal) ease-out',
      'data-open:grid-rows-[1fr] data-instant:transition-none motion-reduce:transition-none',
    ],
    clip: 'min-h-0 overflow-hidden',
    body: 'text-(--ids-color-on-surface)',
  },
  variants: {
    variant: {
      outline: {
        item: 'border-b border-(--ids-color-border) last:border-b-0',
        trigger: 'underline-offset-4 data-hovered:underline',
      },
      soft: {
        root: 'gap-2',
        item: 'bg-(--ids-color-muted) concentric-p-1',
        trigger:
          'px-3 data-hovered:bg-(--ids-color-muted-hover) data-active:bg-(--ids-color-muted-active)',
        body: 'px-3',
      },
      ghost: {
        root: 'gap-1',
        trigger:
          'px-3 data-hovered:bg-(--ids-color-muted) data-active:bg-(--ids-color-muted-hover)',
        body: 'px-3',
      },
    } satisfies Record<AccordionVariant, object>,
    size: {
      standard: {
        trigger: 'py-4 text-body-b3-medium',
        body: 'pb-4 text-body-b3-regular',
      },
      tiny: {
        trigger: 'py-3 text-caption-c1-medium',
        body: 'pb-3 text-caption-c1-regular',
      },
    } satisfies Record<IdsSize, object>,
    placement: {
      end: { indicator: 'ms-auto' },
      inline: {},
    },
  },
  compoundVariants: [
    { variant: 'soft', size: 'standard', class: { trigger: 'py-3', body: 'pb-3' } },
    { variant: 'soft', size: 'tiny', class: { trigger: 'py-2', body: 'pb-2' } },
    { variant: 'ghost', size: 'standard', class: { trigger: 'py-2.5', body: 'pb-3' } },
    { variant: 'ghost', size: 'tiny', class: { trigger: 'py-1.5', body: 'pb-2' } },
  ],
  defaultVariants: { variant: 'outline', size: 'standard', placement: 'end' },
});
