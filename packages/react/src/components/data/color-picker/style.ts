import { sliderSurface } from '../../../internal/slider-surface';
import { cn, tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

const dimOnceAtRoot = {
  slider: cn('data-disabled:opacity-100'),
  input: cn('data-disabled:opacity-100'),
  tool: cn('data-disabled:opacity-100'),
  swatch: cn('data-disabled:opacity-100'),
};

export const colorPickerStyle = tv({
  slots: {
    root: 'grid w-full min-w-0 gap-3 text-(--ids-color-on-surface) data-disabled:opacity-50',
    area: [
      sliderSurface.edge,
      'group/area relative w-full cursor-crosshair touch-none rounded-standard select-none',
      'data-disabled:cursor-not-allowed',
    ],
    areaThumb: [
      sliderSurface.thumb,
      'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2',
      'transition-shadow duration-(--ids-motion-fast) motion-reduce:transition-none',
      'group-has-[input:focus-visible]/area:ring-[3px] group-has-[input:focus-visible]/area:ring-(--ids-color-primary)/50',
    ],
    channel: 'sr-only',
    row: 'flex min-w-0 items-center gap-2',
    sliders: 'grid min-w-0 flex-1 gap-2',
    slider: 'cursor-pointer',
    input: 'flex-1',
    inputText: 'font-mono',
    tool: '',
    swatches: 'gap-2',
    swatch: [
      'rounded-standard shadow-none inset-ring-(--ids-color-on-surface)/10',
      'data-[state=checked]:ring-2 data-[state=checked]:ring-(--radio-accent)',
      'data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-(--ids-color-surface)',
    ],
  },
  variants: {
    size: {
      standard: {
        area: 'h-40',
        areaThumb: 'size-4',
        swatch: 'size-7',
      },
      tiny: {
        area: 'h-32',
        areaThumb: 'size-3.5',
        swatch: 'size-6',
      },
    } satisfies Record<IdsSize, object>,
    disabled: { true: dimOnceAtRoot },
  },
  defaultVariants: { size: 'standard' },
});
