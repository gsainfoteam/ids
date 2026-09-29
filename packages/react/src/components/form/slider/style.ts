import { sliderSurface } from '../../../internal/slider-surface';
import { tv } from '../../../utils';

import type { SliderOrientation } from '.';
import type { IdsSize } from '../../../tokens/types';

export const sliderStyle = tv({
  slots: {
    root: [
      'group/slider relative grid select-none outline-none',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    track: [sliderSurface.edge, 'relative rounded-full bg-(--ids-color-muted)'],
    range: [
      sliderSurface.edge,
      'absolute rounded-full bg-(--ids-color-primary) group-data-invalid/slider:bg-(--ids-color-danger)',
    ],
    thumb: [
      sliderSurface.thumb,
      'group/thumb absolute block size-(--slider-thumb)',
      'bg-(--ids-color-primary) group-data-invalid/slider:bg-(--ids-color-danger)',
      'transition-shadow duration-(--ids-motion-fast) motion-reduce:transition-none focus-ring',
    ],
    valueLabel: [
      'pointer-events-none absolute rounded-indicator px-1.5 py-0.5 whitespace-nowrap',
      'bg-(--ids-color-on-surface) text-caption-c1-medium text-(--ids-color-surface) tabular-nums',
      'opacity-0 transition-opacity duration-(--ids-motion-fast) motion-reduce:transition-none',
      'group-focus-visible/thumb:opacity-100 group-data-dragging/thumb:opacity-100 data-visible:opacity-100',
    ],
    marks: 'relative text-caption-c2-regular text-(--ids-color-on-muted)',
    mark: 'absolute flex items-center gap-1 whitespace-nowrap',
    tick: 'rounded-full bg-(--ids-color-border)',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'w-full grid-rows-(--slider-thumb) touch-pan-y items-center',
        track: 'h-(--slider-track) w-full',
        range: 'h-full',
        thumb: 'top-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2',
        valueLabel: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
        marks: 'mt-1 h-5 w-full',
        mark: '-translate-x-1/2 flex-col rtl:translate-x-1/2',
        tick: 'h-1 w-px',
      },
      vertical: {
        root: 'h-full min-h-44 grid-cols-(--slider-thumb) touch-pan-x justify-items-center',
        track: 'h-full w-(--slider-track)',
        range: 'w-full',
        thumb: 'left-1/2 -translate-x-1/2 translate-y-1/2',
        valueLabel: 'start-full top-1/2 ms-2 -translate-y-1/2',
        marks: 'ms-1 h-full w-10',
        mark: 'translate-y-1/2',
        tick: 'h-px w-1',
      },
    } satisfies Record<SliderOrientation, object>,
    size: {
      standard: { root: '[--slider-thumb:1rem] [--slider-track:0.75rem]' },
      tiny: { root: '[--slider-thumb:0.875rem] [--slider-track:0.625rem]' },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { orientation: 'horizontal', size: 'standard' },
});
