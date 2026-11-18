import { cn, tv } from '../../../utils';

import type { ChipColorScheme, ChipVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

const pointerHover = cn('state-layer hover:state-hover hover:opacity-100');
const replacesIconButtonFill = cn('data-hovered:state-hover data-active:state-press');

const layerInFamilyColor = cn(
  '[--chip-layer:var(--chip-fill)]',
  '[--chip-layer-hover:var(--ids-state-tint-hover)] [--chip-layer-press:var(--ids-state-tint-press)]',
);

const layerInTextColor = cn(
  '[--chip-layer:currentColor]',
  '[--chip-layer-hover:var(--ids-state-hover)] [--chip-layer-press:var(--ids-state-press)]',
);

const drawsTheSchemeLayer = cn(
  '[--ids-state-color:var(--chip-layer)]',
  '[--ids-state-layer-hover:var(--chip-layer-hover)] [--ids-state-layer-press:var(--chip-layer-press)]',
);

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
      neutral: {
        root: [
          '[--chip-fill:var(--ids-color-bg-neutral-bold)] [--chip-on-fill:var(--ids-color-text-on-neutral-bold)] [--chip-tint:var(--ids-color-bg-neutral-subtle)] [--chip-on-tint:var(--ids-color-text-neutral-bold)] [--chip-text:var(--ids-color-text-neutral-bold)] [--chip-line:var(--ids-color-border-neutral)]',
          layerInTextColor,
        ],
      },
      primary: {
        root: [
          '[--chip-fill:var(--ids-color-bg-primary)] [--chip-on-fill:var(--ids-color-text-on-primary)]',
          '[--chip-tint:var(--ids-color-bg-primary-subtle)] [--chip-on-tint:var(--ids-color-text-on-primary-subtle)]',
          '[--chip-text:var(--ids-color-text-primary)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-primary)_40%,transparent)]',
          layerInFamilyColor,
        ],
      },
      secondary: {
        root: [
          '[--chip-fill:var(--ids-color-bg-secondary)] [--chip-on-fill:var(--ids-color-text-on-secondary)]',
          '[--chip-tint:var(--ids-color-bg-secondary-subtle)] [--chip-on-tint:var(--ids-color-text-on-secondary-subtle)]',
          '[--chip-text:var(--ids-color-text-secondary)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-secondary)_40%,transparent)]',
          layerInFamilyColor,
        ],
      },
      tertiary: {
        root: [
          '[--chip-fill:var(--ids-color-bg-tertiary)] [--chip-on-fill:var(--ids-color-text-on-tertiary)]',
          '[--chip-tint:var(--ids-color-bg-tertiary-subtle)] [--chip-on-tint:var(--ids-color-text-on-tertiary-subtle)]',
          '[--chip-text:var(--ids-color-text-tertiary)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-tertiary)_40%,transparent)]',
          layerInFamilyColor,
        ],
      },
      success: {
        root: [
          '[--chip-fill:var(--ids-color-bg-success)] [--chip-on-fill:var(--ids-color-text-on-success)]',
          '[--chip-tint:var(--ids-color-bg-success-subtle)] [--chip-on-tint:var(--ids-color-text-on-success-subtle)]',
          '[--chip-text:var(--ids-color-text-success)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-success)_40%,transparent)]',
          layerInFamilyColor,
        ],
      },
      warning: {
        root: [
          '[--chip-fill:var(--ids-color-bg-warning)] [--chip-on-fill:var(--ids-color-text-on-warning)]',
          '[--chip-tint:var(--ids-color-bg-warning-subtle)] [--chip-on-tint:var(--ids-color-text-on-warning-subtle)]',
          '[--chip-text:var(--ids-color-text-warning)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-warning)_40%,transparent)]',
          layerInFamilyColor,
        ],
      },
      danger: {
        root: [
          '[--chip-fill:var(--ids-color-bg-danger)] [--chip-on-fill:var(--ids-color-text-on-danger)]',
          '[--chip-tint:var(--ids-color-bg-danger-subtle)] [--chip-on-tint:var(--ids-color-text-on-danger-subtle)]',
          '[--chip-text:var(--ids-color-text-danger)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-danger)_40%,transparent)]',
          layerInFamilyColor,
        ],
      },
      info: {
        root: [
          '[--chip-fill:var(--ids-color-bg-info)] [--chip-on-fill:var(--ids-color-text-on-info)]',
          '[--chip-tint:var(--ids-color-bg-info-subtle)] [--chip-on-tint:var(--ids-color-text-on-info-subtle)]',
          '[--chip-text:var(--ids-color-text-info)] [--chip-line:color-mix(in_oklab,var(--ids-color-border-info)_40%,transparent)]',
          layerInFamilyColor,
        ],
      },
    } satisfies Record<ChipColorScheme, object>,
    variant: {
      solid: { root: 'bg-(--chip-fill) text-(--chip-on-fill) state-fill' },
      soft: { root: ['bg-(--chip-tint) text-(--chip-on-tint)', drawsTheSchemeLayer] },
      outline: {
        root: [
          'bg-transparent text-(--chip-text) inset-ring-1 inset-ring-(--chip-line)',
          drawsTheSchemeLayer,
        ],
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
          'transition-[color,background-color,box-shadow,--ids-state-opacity] duration-(--ids-motion-fast)',
          'motion-reduce:transition-none',
          'data-hovered:state-hover data-active:state-press',
          'data-selected:bg-(--chip-fill) data-selected:text-(--chip-on-fill) data-selected:state-fill',
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
