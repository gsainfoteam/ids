import { segmentSurface } from '../../../internal/surfaces/segment-surface';
import { tv } from '../../../utils';

import type { SegmentedControlOrientation } from './context';
import type { IdsSize } from '../../../tokens/types';

export const segmentedControlStyle = tv({
  slots: {
    root: [
      'm-0 flex min-w-0 border-0 outline-none',
      segmentSurface.track,
      'data-invalid:inset-ring-1 data-invalid:inset-ring-danger',
    ],
    item: [
      'relative inline-flex min-w-0 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap select-none',
      segmentSurface.segment,
      'focus-ring',
      'transition-[color,background-color,box-shadow,--ids-state-opacity] duration-(--ids-motion-fast)',
      'motion-reduce:transition-none',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
      '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    ],
    input: [
      'absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-[inherit] opacity-0',
      'disabled:cursor-not-allowed',
    ],
  },
  variants: {
    orientation: {
      horizontal: { root: 'flex-row', item: 'justify-center' },
      vertical: { root: 'flex-col', item: 'justify-start text-start' },
    } satisfies Record<SegmentedControlOrientation, object>,
    stretch: {
      true: { root: 'w-full' },
      false: { root: 'w-fit' },
    },
    size: {
      standard: {
        item: [
          segmentSurface.height.standard,
          'px-3 text-body-b3-medium',
          "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
        ],
      },
      tiny: {
        item: [
          segmentSurface.height.tiny,
          'gap-1.5 px-2.5 text-caption-c1-medium',
          "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-tiny)",
        ],
      },
    } satisfies Record<IdsSize, object>,
  },
  compoundVariants: [{ orientation: 'horizontal', stretch: true, class: { item: 'flex-1' } }],
  defaultVariants: { orientation: 'horizontal', stretch: false, size: 'standard' },
});
