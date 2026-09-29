import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const paginationStyle = tv({
  slots: {
    root: 'flex min-w-0',
    list: 'flex flex-wrap items-center gap-1',
    item: 'flex',
    link: 'tabular-nums aria-[current=page]:data-[variant=ghost]:bg-(--control-press)',
    arrow: 'rtl:[&_svg]:-scale-x-100',
    ellipsis:
      'flex shrink-0 items-center justify-center text-(--ids-color-on-muted) select-none [&_svg]:pointer-events-none',
  },
  variants: {
    size: {
      standard: {
        link: 'min-w-(--ids-size-control-standard) px-2',
        ellipsis: 'size-(--ids-size-control-standard) [&_svg]:size-(--ids-size-icon-standard)',
      },
      tiny: {
        link: 'min-w-(--ids-size-control-tiny) px-1.5',
        ellipsis: 'size-(--ids-size-control-tiny) [&_svg]:size-(--ids-size-icon-tiny)',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { size: 'standard' },
});
