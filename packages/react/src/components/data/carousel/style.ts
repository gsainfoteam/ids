import { slidesLayout, type SlidesOrientation } from '../../../internal/slides/layout';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const carouselStyle = tv({
  slots: {
    root: 'flex min-w-0 flex-col',
    content: [
      slidesLayout.viewport,
      'relative isolate',
      'has-[[data-slide]:focus-visible]:ring-[3px] has-[[data-slide]:focus-visible]:ring-(--ids-color-primary)/40',
    ],
    track: '',
    slide: slidesLayout.slide,
    edgePrev: 'absolute z-10',
    edgeNext: 'absolute z-10',
    step: '',
    controls: [
      'grid grid-cols-[1fr_auto_1fr] items-center',
      '*:data-carousel-indicators:col-start-2',
      '*:data-carousel-pause:col-start-3 *:data-carousel-pause:justify-self-end',
    ],
    indicators: 'flex flex-wrap items-center justify-center',
    indicator: [
      'group/indicator inline-flex h-6 min-w-6 shrink-0 cursor-pointer items-center justify-center px-2',
      'rounded-standard focus-ring',
    ],
    dot: [
      'block rounded-full bg-(--ids-color-handle)',
      'transition-[width,background-color] duration-(--ids-motion-fast) ease-out',
      'motion-reduce:transition-none',
      'group-data-hovered/indicator:bg-(--ids-color-handle-hover)',
      'group-data-active/indicator:bg-(--ids-color-handle-active)',
      'data-current:bg-(--ids-color-primary)',
    ],
    pause: '',
    announcer: 'sr-only',
  },
  variants: {
    orientation: {
      horizontal: {
        track: slidesLayout.track.horizontal,
        edgePrev: 'start-2 top-1/2 -translate-y-1/2',
        edgeNext: 'end-2 top-1/2 -translate-y-1/2',
        step: 'rtl:[&_svg]:-scale-x-100',
      },
      vertical: {
        track: slidesLayout.track.vertical,
        edgePrev: 'top-2 left-1/2 -translate-x-1/2',
        edgeNext: 'bottom-2 left-1/2 -translate-x-1/2',
      },
    } satisfies Record<SlidesOrientation, object>,
    size: {
      standard: {
        root: 'gap-3',
        dot: 'size-2 data-current:w-5',
      },
      tiny: {
        root: 'gap-2',
        dot: 'size-1.5 data-current:w-4',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { orientation: 'horizontal', size: 'standard' },
});
