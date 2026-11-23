import { sliderSurface } from '../../../internal/surfaces/slider-surface';
import { tv } from '../../../utils';

import type { SliderOrientation } from '.';
import type { IdsSize } from '../../../tokens/types';

export const sliderStyle = tv({
  slots: {
    root: [
      'group/slider relative grid select-none outline-none',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    track: [sliderSurface.edge, 'relative rounded-full bg-neutral-soft'],
    range: [
      sliderSurface.edge,
      'absolute rounded-full bg-primary-solid group-data-invalid/slider:bg-danger-solid',
    ],
    thumb: [
      sliderSurface.thumb,
      'group/thumb absolute block size-(--slider-thumb)',
      'bg-primary-solid group-data-invalid/slider:bg-danger-solid',
      'transition-shadow duration-(--ids-motion-fast) motion-reduce:transition-none focus-ring',
    ],
    valueLabel: [
      'pointer-events-none absolute rounded-indicator px-1.5 py-0.5 whitespace-nowrap',
      'bg-neutral-solid text-caption-c1-medium text-on-neutral-solid tabular-nums',
      'opacity-0 transition-opacity duration-(--ids-motion-fast) motion-reduce:transition-none',
      'group-focus-visible/thumb:opacity-100 group-data-dragging/thumb:opacity-100',
    ],
    marks: 'relative text-caption-c2-regular text-neutral',
    mark: 'absolute flex items-center gap-1 whitespace-nowrap',
    tick: 'rounded-full bg-(--ids-color-border-neutral)',
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
      standard: { root: '[--slider-thumb:--spacing(4)] [--slider-track:--spacing(3)]' },
      tiny: { root: '[--slider-thumb:--spacing(3.5)] [--slider-track:--spacing(2.5)]' },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { orientation: 'horizontal', size: 'standard' },
});
