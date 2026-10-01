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
        root: '[--chip-fill:var(--ids-color-on-surface)] [--chip-on-fill:var(--ids-color-surface)] [--chip-tint:var(--ids-color-muted)] [--chip-on-tint:var(--ids-color-on-surface)] [--chip-text:var(--ids-color-on-surface)] [--chip-line:var(--ids-color-border)]',
      },
      primary: {
        root: [
          '[--chip-fill:var(--ids-color-primary)] [--chip-on-fill:var(--ids-color-on-primary)]',
          '[--chip-tint:var(--ids-color-secondary)] [--chip-on-tint:var(--ids-color-on-secondary)]',
          '[--chip-text:var(--ids-color-accent)] [--chip-line:color-mix(in_oklab,var(--ids-color-primary)_40%,transparent)]',
        ],
      },
      success: {
        root: '[--chip-fill:var(--ids-color-success)] [--chip-on-fill:var(--ids-color-on-success)] [--chip-tint:color-mix(in_oklab,var(--ids-color-success)_15%,transparent)] [--chip-on-tint:var(--ids-color-success-strong)] [--chip-text:var(--ids-color-success-strong)] [--chip-line:color-mix(in_oklab,var(--ids-color-success)_40%,transparent)]',
      },
      warning: {
        root: '[--chip-fill:var(--ids-color-warning)] [--chip-on-fill:var(--ids-color-on-warning)] [--chip-tint:color-mix(in_oklab,var(--ids-color-warning)_18%,transparent)] [--chip-on-tint:var(--ids-color-warning-strong)] [--chip-text:var(--ids-color-warning-strong)] [--chip-line:color-mix(in_oklab,var(--ids-color-warning)_50%,transparent)]',
      },
      danger: {
        root: '[--chip-fill:var(--ids-color-danger)] [--chip-on-fill:var(--ids-color-on-danger)] [--chip-tint:color-mix(in_oklab,var(--ids-color-danger)_12%,transparent)] [--chip-on-tint:var(--ids-color-danger-strong)] [--chip-text:var(--ids-color-danger-strong)] [--chip-line:color-mix(in_oklab,var(--ids-color-danger)_40%,transparent)]',
      },
      info: {
        root: '[--chip-fill:var(--ids-color-info)] [--chip-on-fill:var(--ids-color-on-info)] [--chip-tint:color-mix(in_oklab,var(--ids-color-info)_12%,transparent)] [--chip-on-tint:var(--ids-color-info-strong)] [--chip-text:var(--ids-color-info-strong)] [--chip-line:color-mix(in_oklab,var(--ids-color-info)_40%,transparent)]',
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
