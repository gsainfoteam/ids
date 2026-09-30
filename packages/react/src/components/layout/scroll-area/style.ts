import { tv } from '../../../utils';

import type { ScrollArea } from '.';
import type { Axis, Placement } from './geometry';
import type { IdsSize } from '../../../tokens/types';

export const scrollAreaStyle = tv({
  slots: {
    root: 'relative flex min-h-0 min-w-0 flex-col [--scroll-area-gap:2px]',
    viewport: [
      'min-h-0 min-w-0 grow overscroll-none rounded-[inherit] outline-none',
      '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      'data-tab-stop:focus-ring',
    ],
    scrollbar: [
      'group/scrollbar absolute flex touch-none rounded-full select-none',
      'pointer-events-none opacity-0 data-visible:pointer-events-auto data-visible:opacity-100',
      'transition-[opacity,width,height,background-color] duration-(--ids-motion-fast) ease-out',
      'not-data-visible:delay-300 motion-reduce:transition-none',
    ],
    thumb: [
      'absolute rounded-full bg-(--ids-color-handle)',
      'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
      'hover:bg-(--ids-color-handle-hover)',
      'group-data-dragging/scrollbar:bg-(--ids-color-handle-active)',
    ],
    corner: 'absolute size-(--scroll-area-thickness) rounded-full',
  },
  variants: {
    variant: {
      auto: {
        scrollbar: 'hover:bg-(--ids-color-muted) data-dragging:bg-(--ids-color-muted)',
      },
      hover: {
        scrollbar: 'hover:bg-(--ids-color-muted) data-dragging:bg-(--ids-color-muted)',
      },
      always: {
        scrollbar: 'bg-(--ids-color-muted)',
        corner: 'bg-(--ids-color-muted)',
      },
    } satisfies Record<ScrollArea.Variant, object>,
    size: {
      standard: { root: '[--scroll-area-thickness:8px] [--scroll-area-fade-size:24px]' },
      tiny: { root: '[--scroll-area-thickness:6px] [--scroll-area-fade-size:16px]' },
    } satisfies Record<IdsSize, object>,
    scrolls: {
      vertical: { viewport: 'overflow-x-hidden overflow-y-auto' },
      horizontal: { viewport: 'overflow-x-auto overflow-y-hidden' },
      both: { viewport: 'overflow-auto' },
    } satisfies Record<ScrollArea.Orientation, object>,
    axis: {
      y: {
        scrollbar: [
          'top-[var(--scroll-area-inset-start,var(--scroll-area-gap))]',
          'bottom-[var(--scroll-area-inset-end,var(--scroll-area-gap))]',
          'w-(--scroll-area-thickness) hover:w-[calc(var(--scroll-area-thickness)+2px)]',
          'data-dragging:w-[calc(var(--scroll-area-thickness)+2px)]',
        ],
        thumb:
          'inset-x-0 top-0 h-(--scroll-area-thumb-size) translate-y-(--scroll-area-thumb-offset)',
      },
      x: {
        scrollbar: [
          'start-[var(--scroll-area-inset-start,var(--scroll-area-gap))]',
          'end-[var(--scroll-area-inset-end,var(--scroll-area-gap))]',
          'h-(--scroll-area-thickness) hover:h-[calc(var(--scroll-area-thickness)+2px)]',
          'data-dragging:h-[calc(var(--scroll-area-thickness)+2px)]',
        ],
        thumb:
          'inset-y-0 start-0 w-(--scroll-area-thumb-size) translate-x-(--scroll-area-thumb-offset)',
      },
    } satisfies Record<Axis, object>,
    placement: { start: {}, end: {} } satisfies Record<Placement, object>,
    vertical: {
      start: { corner: 'start-(--scroll-area-gap)' },
      end: { corner: 'end-(--scroll-area-gap)' },
    } satisfies Record<Placement, object>,
    horizontal: {
      start: { corner: 'top-(--scroll-area-gap)' },
      end: { corner: 'bottom-(--scroll-area-gap)' },
    } satisfies Record<Placement, object>,
    fade: {
      vertical: {
        viewport:
          '[mask-image:linear-gradient(to_bottom,transparent,#000_min(var(--scroll-area-fade-size),var(--scroll-area-overflow-y-start,0px)),#000_calc(100%-min(var(--scroll-area-fade-size),var(--scroll-area-overflow-y-end,0px))),transparent)]',
      },
      horizontal: {
        viewport:
          '[mask-image:linear-gradient(var(--scroll-area-fade-x-direction),transparent,#000_min(var(--scroll-area-fade-size),var(--scroll-area-overflow-x-start,0px)),#000_calc(100%-min(var(--scroll-area-fade-size),var(--scroll-area-overflow-x-end,0px))),transparent)]',
      },
      both: {
        viewport: [
          '[mask-image:linear-gradient(to_bottom,transparent,#000_min(var(--scroll-area-fade-size),var(--scroll-area-overflow-y-start,0px)),#000_calc(100%-min(var(--scroll-area-fade-size),var(--scroll-area-overflow-y-end,0px))),transparent),linear-gradient(var(--scroll-area-fade-x-direction),transparent,#000_min(var(--scroll-area-fade-size),var(--scroll-area-overflow-x-start,0px)),#000_calc(100%-min(var(--scroll-area-fade-size),var(--scroll-area-overflow-x-end,0px))),transparent)]',
          '[mask-composite:intersect]',
        ],
      },
    } satisfies Record<ScrollArea.Orientation, object>,
    occupied: {
      true: { corner: 'size-auto rounded-none bg-transparent' },
      false: {},
    },
  },
  compoundVariants: [
    { axis: 'y', placement: 'end', class: { scrollbar: 'end-(--scroll-area-gap)' } },
    { axis: 'y', placement: 'start', class: { scrollbar: 'start-(--scroll-area-gap)' } },
    { axis: 'x', placement: 'end', class: { scrollbar: 'bottom-(--scroll-area-gap)' } },
    { axis: 'x', placement: 'start', class: { scrollbar: 'top-(--scroll-area-gap)' } },
    {
      fade: ['vertical', 'horizontal', 'both'],
      class: { viewport: 'data-tab-stop:focus-visible:mask-none' },
    },
    {
      fade: ['vertical', 'both'],
      class: { viewport: 'scroll-py-(--scroll-area-fade-size)' },
    },
    {
      fade: ['horizontal', 'both'],
      class: {
        viewport: [
          'scroll-px-(--scroll-area-fade-size)',
          '[--scroll-area-fade-x-direction:to_right] rtl:[--scroll-area-fade-x-direction:to_left]',
        ],
      },
    },
    { occupied: true, vertical: 'end', class: { corner: 'end-0' } },
    { occupied: true, vertical: 'start', class: { corner: 'start-0' } },
    { occupied: true, horizontal: 'end', class: { corner: 'bottom-0' } },
    { occupied: true, horizontal: 'start', class: { corner: 'top-0' } },
  ],
  defaultVariants: {
    variant: 'hover',
    size: 'standard',
    scrolls: 'vertical',
    placement: 'end',
    vertical: 'end',
    horizontal: 'end',
    occupied: false,
  },
});
