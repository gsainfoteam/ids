import { tv } from '../../../utils';

import type { Divider } from '.';

export const dividerStyle = tv({
  slots: {
    root: 'shrink-0 border-0',
    label: 'min-w-0 text-center text-caption-c1-medium text-(--ids-color-on-muted)',
  },
  variants: {
    orientation: { horizontal: {}, vertical: {} } satisfies Record<Divider.Orientation, object>,
    labelled: {
      false: { root: 'bg-(--ids-color-border)' },
      true: {
        root: [
          'flex items-center',
          'before:shrink before:bg-(--ids-color-border) after:shrink after:bg-(--ids-color-border)',
        ],
      },
    },
    align: { start: {}, center: {}, end: {} } satisfies Record<Divider.Align, object>,
  },
  compoundVariants: [
    { labelled: true, align: 'start', class: { root: 'before:hidden' } },
    { labelled: true, align: 'end', class: { root: 'after:hidden' } },
    { orientation: 'horizontal', labelled: false, class: { root: 'h-px w-full' } },
    {
      orientation: 'vertical',
      labelled: false,
      class: { root: 'min-h-[1lh] w-px self-stretch' },
    },
    {
      orientation: 'horizontal',
      labelled: true,
      class: {
        root: 'w-full gap-3 before:h-px before:min-w-4 before:flex-1 after:h-px after:min-w-4 after:flex-1',
      },
    },
    {
      orientation: 'vertical',
      labelled: true,
      class: {
        root: 'flex-col gap-2 self-stretch before:min-h-2 before:w-px before:flex-1 after:min-h-2 after:w-px after:flex-1',
      },
    },
  ],
  defaultVariants: { orientation: 'horizontal', labelled: false, align: 'center' },
});
