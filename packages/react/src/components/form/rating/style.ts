import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type RatingOptionPlacement = 'zero' | 'whole' | 'start' | 'end';

export const ratingStyle = tv({
  slots: {
    root: [
      'relative inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-standard outline-none',
      '[--rating-accent:var(--ids-color-primary)]',
      'data-invalid:[--rating-accent:var(--ids-color-danger)]',
      'has-[[data-rating-value="0"]:focus-visible]:ring-[3px] has-[[data-rating-value="0"]:focus-visible]:ring-(--ids-color-primary)/40',
      'data-disabled:opacity-50',
    ],
    item: 'relative inline-flex shrink-0 items-center justify-center rounded-standard focus-ring',
    graphic: 'pointer-events-none relative block size-full [&_svg]:size-full',
    empty:
      'absolute inset-0 text-(--ids-color-border) in-data-invalid:text-(--ids-color-danger)/35',
    fill: [
      'absolute inset-0 text-(--rating-accent) in-data-previewing:opacity-50',
      '[clip-path:inset(0_calc(100%-var(--rating-fill))_0_0)]',
      'rtl:[clip-path:inset(0_0_0_calc(100%-var(--rating-fill)))]',
    ],
    option:
      'absolute inset-y-0 cursor-pointer touch-manipulation rounded-standard outline-none disabled:cursor-not-allowed',
  },
  variants: {
    size: {
      standard: {
        root: 'min-h-(--ids-size-control-standard)',
        item: 'size-7',
      },
      tiny: {
        root: 'min-h-(--ids-size-control-tiny)',
        item: 'size-5.5',
      },
    } satisfies Record<IdsSize, object>,
    placement: {
      zero: { option: 'sr-only' },
      whole: { option: 'inset-x-0' },
      start: { option: 'start-0 w-1/2' },
      end: { option: 'end-0 w-1/2' },
    } satisfies Record<RatingOptionPlacement, object>,
  },
  defaultVariants: { size: 'standard' },
});
