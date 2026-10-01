import { cn } from '../utils/cn';

export const brandFillStates = cn(
  '[--control-fill-hover:color-mix(in_oklab,var(--control-fill)_90%,transparent)]',
  '[--control-fill-press:color-mix(in_oklab,var(--control-fill)_80%,transparent)]',
  'supports-[color:oklch(from_red_l_c_h)]:[--control-away-from-text:oklch(from_var(--control-on-fill)_clamp(0,(0.5_-_l)*1000,1)_0_0)]',
  'supports-[color:oklch(from_red_l_c_h)]:[--control-fill-hover:color-mix(in_oklab,var(--control-fill),var(--control-away-from-text)_10%)]',
  'supports-[color:oklch(from_red_l_c_h)]:[--control-fill-press:color-mix(in_oklab,var(--control-fill),var(--control-away-from-text)_20%)]',
);

export const primaryFill = cn(
  '[--control-fill:var(--ids-color-primary)] [--control-on-fill:var(--ids-color-on-primary)]',
  brandFillStates,
);
