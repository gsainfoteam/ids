import { tv } from '../../../utils';

import type { Marker } from '.';
import type { IdsSize } from '../../../tokens/types';

export const markerStyle = tv({
  slots: {
    root: [
      'flex w-full min-w-0 items-center text-start wrap-break-word text-(--ids-color-on-muted)',
      '[&_svg]:shrink-0',
      '[&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-(--ids-color-on-surface)',
      'focus-ring [a&]:underline [a&]:underline-offset-2',
      '[&:is(a,button)]:cursor-pointer [&:is(a,button)]:transition-colors [&:is(a,button)]:duration-(--ids-motion-fast) motion-reduce:transition-none',
      '[&:is(a,button)]:hover:text-(--ids-color-on-surface)',
    ],
    content: 'flex min-w-0 items-center',
    line: 'w-auto min-w-4 flex-1',
  },
  variants: {
    variant: {
      default: { root: 'rounded-standard' },
      underline: { root: 'border-b border-(--ids-color-border) pb-2' },
      separator: { root: 'rounded-standard gap-3', content: 'justify-center text-center' },
    } satisfies Record<Marker.Variant, object>,
    size: {
      standard: {
        root: 'text-body-b3-regular [&_svg:not([class*=size-])]:size-(--ids-size-icon-standard)',
        content: 'gap-2',
      },
      tiny: {
        root: 'text-caption-c1-regular [&_svg:not([class*=size-])]:size-(--ids-size-icon-tiny)',
        content: 'gap-1.5',
      },
    } satisfies Record<IdsSize, object>,
    pending: {
      true: { content: 'shimmer' },
      false: {},
    },
  },
  defaultVariants: { variant: 'default', size: 'standard', pending: false },
});
