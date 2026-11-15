import { tv } from '../../../utils';

import type { Divider } from '.';

export const dividerStyle = tv({
  slots: {
    root: 'm-0 shrink-0 border-0',
    label: 'min-w-0 text-center text-caption-c1-medium text-neutral',
  },
  variants: {
    orientation: { horizontal: {}, vertical: {} } satisfies Record<Divider.Orientation, object>,
    labelled: {
      false: { root: 'bg-(--ids-color-border-neutral)' },
      true: {
        root: [
          'flex items-center',
          'before:shrink before:bg-(--ids-color-border-neutral) after:shrink after:bg-(--ids-color-border-neutral)',
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
      class: { root: 'h-auto min-h-[1lh] w-px self-stretch' },
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
