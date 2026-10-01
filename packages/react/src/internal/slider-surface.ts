import { cn } from '../utils/cn';

export const sliderSurface = {
  edge: cn('inset-ring-1 inset-ring-(--ids-color-on-surface)/10'),
  thumb: cn(
    'rounded-full border-2 border-white',
    'shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_1px_3px_rgb(0_0_0/0.3)]',
  ),
} as const;
