import { cn } from '../utils/cn';

export const brandFillStates = cn(
  '[--control-away-from-text:oklch(from_var(--control-on-fill)_clamp(0,(0.5_-_l)*1000,1)_0_0)]',
  '[--control-fill-hover:color-mix(in_oklab,var(--control-fill),var(--control-away-from-text)_10%)]',
  '[--control-fill-press:color-mix(in_oklab,var(--control-fill),var(--control-away-from-text)_20%)]',
);

export const primaryFill = cn(
  '[--control-fill:var(--ids-color-primary)] [--control-on-fill:var(--ids-color-on-primary)]',
  brandFillStates,
);
