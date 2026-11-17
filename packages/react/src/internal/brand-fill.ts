import { cn } from '../utils/cn';

export const fillStatesAwayFromText = cn(
  '[--control-away-from-text:oklch(from_var(--control-on-fill)_clamp(0,(0.5_-_l)*1000,1)_0_0)]',
  '[--control-fill-hover:color-mix(in_oklab,var(--control-fill),var(--control-away-from-text)_10%)]',
  '[--control-fill-press:color-mix(in_oklab,var(--control-fill),var(--control-away-from-text)_20%)]',
);

export const primaryFill = cn(
  '[--control-fill:var(--ids-color-bg-primary)] [--control-on-fill:var(--ids-color-text-on-primary)]',
  '[--control-fill-hover:var(--ids-color-bg-primary-hover)] [--control-fill-press:var(--ids-color-bg-primary-active)]',
);
