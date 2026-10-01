import { clamp, range } from 'es-toolkit';

import { cn } from '../../utils/cn';

export type SlidesOrientation = 'horizontal' | 'vertical';
export type SlidesAlign = 'start' | 'center' | 'end';
export type SlidesPerScroll = number | 'auto';

export const slidesLayout = {
  viewport: cn('overflow-hidden'),
  track: {
    horizontal: cn(
      'flex h-full touch-pan-y touch-pinch-zoom gap-[inherit]',
      '[--slides-sign:-1] rtl:[--slides-sign:1]',
      'transform-[translate3d(calc(var(--slides-offset,0)*var(--slides-sign)*(100%_+_var(--slides-gap,0px))/var(--slides-per-view,1)),0,0)]',
    ),
    vertical: cn(
      'flex h-full flex-col touch-pan-x touch-pinch-zoom gap-[inherit]',
      'transform-[translate3d(0,calc(var(--slides-offset,0)*-1*(100%_+_var(--slides-gap,0px))/var(--slides-per-view,1)),0)]',
    ),
  } satisfies Record<SlidesOrientation, string>,
  slide: cn(
    'min-h-0 min-w-0 shrink-0 grow-0 outline-none',
    'basis-[calc((100%_-_(var(--slides-per-view,1)_-_1)*var(--slides-gap,0px))/var(--slides-per-view,1))]',
  ),
};

export type SlidesEstimate = {
  snapCount: number;
  slidesOf: (snap: number) => number[];
  offsetOf: (snap: number) => number;
  inViewOf: (snap: number) => number[];
};

type EstimateOptions = {
  slideCount: number;
  perView: number;
  perScroll: SlidesPerScroll;
  loop: boolean;
  align: SlidesAlign;
};

export const viewableCount = (perView: number) =>
  Number.isFinite(perView) && perView > 0 ? perView : 1;

function groupSize(perView: number, perScroll: SlidesPerScroll) {
  if (perScroll === 'auto') return Math.max(1, Math.floor(perView));
  return Number.isFinite(perScroll) ? Math.max(1, Math.floor(perScroll)) : 1;
}

function alignmentShift(align: SlidesAlign, perView: number, group: number) {
  if (align === 'center') return (perView - group) / 2;
  if (align === 'end') return perView - group;
  return 0;
}

export function estimateSlides({
  slideCount,
  perView: requestedPerView,
  perScroll,
  loop,
  align,
}: EstimateOptions): SlidesEstimate {
  const perView = viewableCount(requestedPerView);
  const group = groupSize(perView, perScroll);
  const overflow = Math.max(0, slideCount - perView);
  const snapsWhileContained = overflow === 0 ? 1 : Math.ceil(overflow / group) + 1;
  const snapCount =
    slideCount === 0 ? 0 : loop ? Math.ceil(slideCount / group) : snapsWhileContained;
  const shift = alignmentShift(align, perView, group);

  const offsetOf = (snap: number) => clamp(snap * group - shift, 0, overflow);

  const slidesOf = (snap: number) => {
    const first = Math.min(snap * group, slideCount);
    const end = snap === snapCount - 1 ? slideCount : Math.min(slideCount, first + group);
    return range(first, end);
  };

  const inViewOf = (snap: number) => {
    const start = offsetOf(snap);
    return range(Math.floor(start), Math.min(slideCount, Math.ceil(start + perView)));
  };

  return { snapCount, slidesOf, offsetOf, inViewOf };
}
