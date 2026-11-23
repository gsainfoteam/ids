import { fieldSurface } from '../../../internal/surfaces/field-surface';
import { insetButtons } from '../../../internal/text-control/style';
import { tv } from '../../../utils';

import type { TextAreaVariant } from '.';
import type { TextAreaHandle } from './use-text-area';
import type { IdsSize } from '../../../tokens/types';

export const textAreaStyle = tv({
  slots: {
    root: [
      'flex w-full min-w-0 cursor-text flex-col overflow-hidden rounded-standard',
      fieldSurface.base,
    ],
    bar: [
      'mx-px flex shrink-0 items-center empty:hidden',
      'border-neutral',
      'not-has-[button]:text-neutral',
      '[&_svg]:shrink-0',
      insetButtons.base,
    ],
    scrollArea: [
      'grow rounded-[inherit]',
      '[:not(:empty)+&]:rounded-t-none [&:has(+:not(:empty))]:rounded-b-none',
    ],
    input: [
      'w-full min-w-0 grow resize-none bg-transparent outline-none',
      'text-inherit placeholder:text-neutral',
      'selection:bg-primary-solid/30 selection:text-neutral-strong',
      'disabled:cursor-not-allowed',
      'py-(--text-area-pad-y)',
    ],
    count: ['ms-auto shrink-0 text-neutral tabular-nums', 'data-near-limit:text-neutral-strong'],
  },
  variants: {
    variant: {
      outline: { root: fieldSurface.variant.outline, bar: 'border-field-bar' },
      soft: { root: fieldSurface.variant.soft, bar: 'border-field-bar' },
      ghost: { root: fieldSurface.variant.ghost },
    } satisfies Record<TextAreaVariant, object>,
    size: {
      standard: {
        root: 'text-body-b3-regular',
        bar: [
          'gap-1 px-3 py-1.5 [&_svg]:size-(--ids-size-icon-standard)',
          insetButtons.size.standard,
          '[&>:first-child:is(button,:has(button))]:-ms-1.5 [&>:last-child:is(button,:has(button))]:-me-1.5',
        ],
        input: 'px-3 [--text-area-pad-y:--spacing(2)]',
        count: 'text-caption-c1-regular',
      },
      tiny: {
        root: 'text-caption-c1-regular',
        bar: [
          'gap-0.5 px-2 py-1 [&_svg]:size-(--ids-size-icon-tiny)',
          insetButtons.size.tiny,
          '[&>:first-child:is(button,:has(button))]:-ms-1 [&>:last-child:is(button,:has(button))]:-me-1',
        ],
        input: 'px-2 [--text-area-pad-y:--spacing(2)]',
        count: 'text-caption-c2-regular',
      },
    } satisfies Record<IdsSize, object>,
    position: {
      top: { bar: 'border-b' },
      bottom: { bar: 'border-t' },
    },
    resize: {
      none: {},
      vertical: {
        root: 'relative overflow-visible',
        input: 'min-h-[calc(1lh+var(--text-area-pad-y)*2)]',
      },
      horizontal: { root: 'relative min-w-24 overflow-visible' },
      both: {
        root: 'relative min-w-24 overflow-visible',
        input: 'min-h-[calc(1lh+var(--text-area-pad-y)*2)]',
      },
    } satisfies Record<TextAreaHandle, object>,
  },
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
    resize: 'none',
  },
});
