import { tv } from '../../../utils';

import type { MarqueeVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export type MarqueeOrientation = 'horizontal' | 'vertical';

export type MarqueePauseSpace = IdsSize | 'none';

export const marqueeStyle = tv({
  slots: {
    root: [
      'grid w-full min-w-0 grid-cols-1 grid-rows-1 gap-8 [--marquee-fade:min(15%,--spacing(20))]',
      '[--marquee-play-state:running] data-paused:[--marquee-play-state:paused]',
      'motion-reduce:h-auto motion-reduce:max-h-none',
    ],
    viewport: [
      'col-start-1 row-start-1 flex min-h-0 min-w-0 gap-[inherit] overflow-clip',
      'hover:[--marquee-play-state:paused] has-focus-visible:[--marquee-play-state:paused]',
      'motion-reduce:overflow-visible motion-reduce:[mask-image:none]',
    ],
    track: [
      'flex shrink-0 gap-[inherit] animate-marquee after:order-last after:size-0 after:shrink-0',
      'data-swapped:[&>:first-child]:order-1',
      'motion-reduce:w-full motion-reduce:min-w-0 motion-reduce:shrink',
      'motion-reduce:animate-none motion-reduce:after:hidden',
    ],
    content: [
      'm-0 flex shrink-0 list-none justify-around gap-[inherit] p-0',
      'motion-reduce:w-full motion-reduce:shrink',
      'motion-reduce:flex-wrap motion-reduce:justify-center',
    ],
    listItem: 'flex shrink-0 flex-col motion-reduce:max-w-full',
    item: 'shrink-0 whitespace-nowrap motion-reduce:max-w-full motion-reduce:whitespace-normal',
    pause: 'col-start-1 row-start-1 self-center justify-self-end motion-reduce:hidden',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'items-center',
        viewport: '-my-1 flex-row py-1 @container',
        track: 'flex-row [--marquee-translate:-50%] rtl:[--marquee-translate:50%]',
        content: 'min-w-[100cqw] flex-row items-center motion-reduce:min-w-0',
      },
      vertical: {
        root: 'items-stretch',
        viewport: '-mx-1 flex-col px-1 @container-[size] motion-reduce:@container-normal',
        track: 'flex-col [--marquee-translate:0_-50%]',
        content: 'min-h-[100cqh] flex-col motion-reduce:min-h-0',
      },
    } satisfies Record<MarqueeOrientation, object>,
    variant: {
      fade: {},
      plain: {},
    } satisfies Record<MarqueeVariant, object>,
    copy: {
      true: { content: 'motion-reduce:hidden' },
    },
    reverse: {
      true: { track: '[--marquee-direction:reverse]' },
    },
    pauseSpace: {
      none: {},
      standard: {
        viewport: 'me-[calc(var(--ids-size-control-standard)+--spacing(2))] motion-reduce:me-0',
      },
      tiny: {
        viewport: 'me-[calc(var(--ids-size-control-tiny)+--spacing(2))] motion-reduce:me-0',
      },
    } satisfies Record<MarqueePauseSpace, object>,
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      variant: 'fade',
      class: {
        viewport:
          '[mask-image:linear-gradient(to_right,transparent,#000_var(--marquee-fade),#000_calc(100%-var(--marquee-fade)),transparent)]',
      },
    },
    {
      orientation: 'vertical',
      variant: 'fade',
      class: {
        viewport:
          '[mask-image:linear-gradient(to_bottom,transparent,#000_var(--marquee-fade),#000_calc(100%-var(--marquee-fade)),transparent)]',
      },
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'fade',
    pauseSpace: 'none',
  },
});
