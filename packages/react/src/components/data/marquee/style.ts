import { tv } from '../../../utils';

import type { MarqueeOrientation } from '.';
import type { IdsSize } from '../../../tokens/types';

export type MarqueeMotion = 'on' | 'off' | 'media';

export type MarqueePauseSpace = IdsSize | 'none';

export const marqueeStyle = tv({
  slots: {
    root: [
      'grid w-full min-w-0 grid-cols-1 grid-rows-1 gap-8 [--marquee-fade:min(15%,5rem)]',
      '[--ids-marquee-play-state:running] data-paused:[--ids-marquee-play-state:paused]',
      'data-reduced-motion:h-auto data-reduced-motion:max-h-none',
    ],
    viewport: 'col-start-1 row-start-1 flex min-h-0 min-w-0 gap-[inherit]',
    track: 'flex gap-[inherit]',
    content: 'flex gap-[inherit]',
    item: 'shrink-0 whitespace-nowrap',
    pause: 'col-start-1 row-start-1 self-center justify-self-end',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'items-center',
        viewport: '-my-1 flex-row py-1',
        track: 'flex-row',
        content: 'flex-row items-center',
      },
      vertical: {
        root: 'items-stretch',
        viewport: '-mx-1 flex-col px-1',
        track: 'flex-col',
        content: 'flex-col',
      },
    } satisfies Record<MarqueeOrientation, object>,
    motion: {
      on: {},
      off: {
        track: 'w-full min-w-0',
        content: 'w-full flex-wrap justify-center',
        item: 'max-w-full whitespace-normal',
      },
      media: {
        root: 'motion-reduce:h-auto motion-reduce:max-h-none',
        viewport: 'motion-reduce:overflow-visible motion-reduce:[mask-image:none]',
        track: [
          'motion-reduce:w-full motion-reduce:min-w-0 motion-reduce:shrink',
          'motion-reduce:animate-none motion-reduce:after:hidden',
        ],
        content: [
          'motion-reduce:w-full motion-reduce:shrink',
          'motion-reduce:flex-wrap motion-reduce:justify-center',
        ],
        item: 'motion-reduce:max-w-full motion-reduce:whitespace-normal',
        pause: 'motion-reduce:hidden',
      },
    } satisfies Record<MarqueeMotion, object>,
    copy: {
      true: {},
    },
    reverse: {
      true: { track: '[--ids-marquee-direction:reverse]' },
    },
    fade: {
      true: {},
    },
    pauseSpace: {
      none: {},
      standard: { viewport: 'me-[calc(var(--ids-size-control-standard)+--spacing(2))]' },
      tiny: { viewport: 'me-[calc(var(--ids-size-control-tiny)+--spacing(2))]' },
    } satisfies Record<MarqueePauseSpace, object>,
    pauseOnHover: {
      true: { viewport: 'hover:[--ids-marquee-play-state:paused]' },
    },
    pauseOnFocus: {
      true: { viewport: 'has-focus-visible:[--ids-marquee-play-state:paused]' },
    },
  },
  compoundVariants: [
    {
      motion: ['on', 'media'],
      class: {
        viewport: 'overflow-clip',
        track: [
          'shrink-0 animate-marquee after:order-last after:size-0 after:shrink-0',
          'data-swapped:[&>:first-child]:order-1',
        ],
        content: 'shrink-0 justify-around',
      },
    },
    {
      orientation: 'horizontal',
      motion: ['on', 'media'],
      class: {
        viewport: '@container',
        track: '[--ids-marquee-translate:-50%] rtl:[--ids-marquee-translate:50%]',
        content: 'min-w-[100cqw]',
      },
    },
    {
      orientation: 'vertical',
      motion: ['on', 'media'],
      class: {
        viewport: '@container-[size]',
        track: '[--ids-marquee-translate:0_-50%]',
        content: 'min-h-[100cqh]',
      },
    },
    {
      orientation: 'horizontal',
      motion: 'media',
      class: { content: 'motion-reduce:min-w-0' },
    },
    {
      orientation: 'vertical',
      motion: 'media',
      class: { viewport: 'motion-reduce:@container-normal', content: 'motion-reduce:min-h-0' },
    },
    {
      orientation: 'horizontal',
      motion: ['on', 'media'],
      fade: true,
      class: {
        viewport:
          '[mask-image:linear-gradient(to_right,transparent,#000_var(--marquee-fade),#000_calc(100%-var(--marquee-fade)),transparent)]',
      },
    },
    {
      orientation: 'vertical',
      motion: ['on', 'media'],
      fade: true,
      class: {
        viewport:
          '[mask-image:linear-gradient(to_bottom,transparent,#000_var(--marquee-fade),#000_calc(100%-var(--marquee-fade)),transparent)]',
      },
    },
    {
      motion: 'media',
      pauseSpace: ['standard', 'tiny'],
      class: { viewport: 'motion-reduce:me-0' },
    },
    { motion: 'media', copy: true, class: { content: 'motion-reduce:hidden' } },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    motion: 'on',
    pauseSpace: 'none',
  },
});
