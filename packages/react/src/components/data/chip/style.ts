import { cn, tv } from '../../../utils';

import type { ChipColorScheme, ChipVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

const pointerHover = cn('state-layer hover:state-hover hover:opacity-100');
const replacesIconButtonFill = cn('data-hovered:state-hover data-active:state-press');

export const chipStyle = tv({
  slots: {
    root: [
      'inline-flex shrink-0 items-center rounded-full align-middle whitespace-nowrap',
      'state-layer',
      'data-disabled:opacity-50',
    ],
    icon: 'inline-flex shrink-0 [&_svg]:size-[1.15em]',
    label: 'min-w-0 truncate',
    close: [
      'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-current opacity-60',
      pointerHover,
      replacesIconButtonFill,
      'transition-[opacity,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
      '[&_svg]:size-[0.95em]',
    ],
  },
  variants: {
    colorScheme: {
      neutral: { root: 'scheme-neutral' },
      primary: { root: 'scheme-primary' },
      secondary: { root: 'scheme-secondary' },
      tertiary: { root: 'scheme-tertiary' },
      success: { root: 'scheme-success' },
      warning: { root: 'scheme-warning' },
      danger: { root: 'scheme-danger' },
      info: { root: 'scheme-info' },
    } satisfies Record<ChipColorScheme, object>,
    variant: {
      solid: { root: 'bg-scheme-solid text-on-scheme-solid state-fill' },
      soft: { root: 'bg-scheme-soft text-on-scheme-soft state-scheme' },
      outline: { root: 'bg-transparent text-scheme inset-ring-1 inset-ring-neutral state-scheme' },
    } satisfies Record<ChipVariant, object>,
    size: {
      standard: {
        root: 'h-5.5 gap-1 px-2 text-caption-c1-medium has-[>[data-chip-close]:last-child]:pe-1',
        close: 'size-4',
      },
      tiny: {
        root: 'h-4.5 gap-0.5 px-1.5 text-caption-c2-medium has-[>[data-chip-close]:last-child]:pe-0.5',
        close: 'size-3.5',
      },
    } satisfies Record<IdsSize, object>,
    dot: { true: {}, false: {} },
    interactive: {
      true: {
        root: [
          'cursor-pointer select-none focus-ring',
          'transition-[color,background-color,box-shadow,--ids-state-opacity] duration-(--ids-motion-fast)',
          'motion-reduce:transition-none',
          'data-hovered:state-hover data-active:state-press',
          'data-selected:bg-scheme-solid data-selected:text-on-scheme-solid data-selected:state-fill',
          'disabled:cursor-not-allowed disabled:opacity-50',
        ],
      },
      false: {},
    },
  },
  compoundVariants: [
    { dot: true, size: 'standard', class: { root: 'size-2.5 px-0' } },
    { dot: true, size: 'tiny', class: { root: 'size-2 px-0' } },
  ],
  defaultVariants: {
    dot: false,
    variant: 'soft',
    colorScheme: 'neutral',
    size: 'standard',
    interactive: false,
  },
});
