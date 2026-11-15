import { cn, tv } from '../../../utils';

import type { ChipColorScheme, ChipVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

const pointerHover = cn('hover:bg-current/15 hover:opacity-100');
const replacesIconButtonFill = cn('data-hovered:bg-current/15 data-active:bg-current/15');

export const chipStyle = tv({
  slots: {
    root: [
      'inline-flex shrink-0 items-center rounded-full align-middle whitespace-nowrap',
      'bg-[image:linear-gradient(var(--chip-layer),var(--chip-layer))] [--chip-layer:transparent]',
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
      neutral: {
        root: '[--chip-fill:var(--ids-color-on-surface)] [--chip-on-fill:var(--ids-color-surface)] [--chip-tint:var(--ids-color-bg-neutral-soft)] [--chip-on-tint:var(--ids-color-on-surface)] [--chip-text:var(--ids-color-on-surface)] [--chip-line:var(--ids-color-border-neutral)]',
      },
      primary: {
        root: [
          '[--chip-fill:var(--ids-color-bg-primary)] [--chip-on-fill:var(--ids-color-text-on-primary)]',
          '[--chip-tint:var(--ids-color-bg-primary-soft)] [--chip-on-tint:var(--ids-color-text-on-primary-soft)]',
          '[--chip-text:var(--ids-color-text-primary)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-primary)_40%,transparent)]',
        ],
      },
      secondary: {
        root: [
          '[--chip-fill:var(--ids-color-bg-secondary)] [--chip-on-fill:var(--ids-color-text-on-secondary)]',
          '[--chip-tint:var(--ids-color-bg-secondary-soft)] [--chip-on-tint:var(--ids-color-text-on-secondary-soft)]',
          '[--chip-text:var(--ids-color-text-secondary)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-secondary)_40%,transparent)]',
        ],
      },
      tertiary: {
        root: [
          '[--chip-fill:var(--ids-color-bg-tertiary)] [--chip-on-fill:var(--ids-color-text-on-tertiary)]',
          '[--chip-tint:var(--ids-color-bg-tertiary-soft)] [--chip-on-tint:var(--ids-color-text-on-tertiary-soft)]',
          '[--chip-text:var(--ids-color-text-tertiary)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-tertiary)_40%,transparent)]',
        ],
      },
      success: {
        root: [
          '[--chip-fill:var(--ids-color-bg-success)] [--chip-on-fill:var(--ids-color-text-on-success)]',
          '[--chip-tint:var(--ids-color-bg-success-soft)] [--chip-on-tint:var(--ids-color-text-on-success-soft)]',
          '[--chip-text:var(--ids-color-text-success)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-success)_40%,transparent)]',
        ],
      },
      warning: {
        root: [
          '[--chip-fill:var(--ids-color-bg-warning)] [--chip-on-fill:var(--ids-color-text-on-warning)]',
          '[--chip-tint:var(--ids-color-bg-warning-soft)] [--chip-on-tint:var(--ids-color-text-on-warning-soft)]',
          '[--chip-text:var(--ids-color-text-warning)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-warning)_40%,transparent)]',
        ],
      },
      danger: {
        root: [
          '[--chip-fill:var(--ids-color-bg-danger)] [--chip-on-fill:var(--ids-color-text-on-danger)]',
          '[--chip-tint:var(--ids-color-bg-danger-soft)] [--chip-on-tint:var(--ids-color-text-on-danger-soft)]',
          '[--chip-text:var(--ids-color-text-danger)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-danger)_40%,transparent)]',
        ],
      },
      info: {
        root: [
          '[--chip-fill:var(--ids-color-bg-info)] [--chip-on-fill:var(--ids-color-text-on-info)]',
          '[--chip-tint:var(--ids-color-bg-info-soft)] [--chip-on-tint:var(--ids-color-text-on-info-soft)]',
          '[--chip-text:var(--ids-color-text-info)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-info)_40%,transparent)]',
        ],
      },
    } satisfies Record<ChipColorScheme, object>,
    variant: {
      solid: { root: 'bg-(--chip-fill) text-(--chip-on-fill)' },
      soft: { root: 'bg-(--chip-tint) text-(--chip-on-tint)' },
      outline: {
        root: 'bg-transparent text-(--chip-text) inset-ring-1 inset-ring-(--chip-line)',
      },
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
    interactive: {
      true: {
        root: [
          'cursor-pointer select-none focus-ring',
          'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
          'motion-reduce:transition-none',
          'data-hovered:[--chip-layer:color-mix(in_oklab,currentColor_10%,transparent)]',
          'data-active:[--chip-layer:color-mix(in_oklab,currentColor_16%,transparent)]',
          'data-selected:bg-(--chip-fill) data-selected:text-(--chip-on-fill)',
          'disabled:cursor-not-allowed disabled:opacity-50',
        ],
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'soft',
    colorScheme: 'neutral',
    size: 'standard',
    interactive: false,
  },
});
