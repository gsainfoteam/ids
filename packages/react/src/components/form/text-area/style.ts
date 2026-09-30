import { fieldSurface } from '../../../internal/field-surface';
import { insetButtons } from '../../../internal/text-control/style';
import { tv } from '../../../utils';

import type { TextAreaVariant } from '.';
import type { TextAreaResize } from './use-text-area';
import type { IdsSize } from '../../../tokens/types';

export const textAreaStyle = tv({
  slots: {
    root: [
      'flex w-full min-w-0 cursor-text flex-col overflow-hidden rounded-standard',
      fieldSurface.base,
    ],
    bar: [
      'flex shrink-0 items-center empty:hidden',
      'border-(--ids-color-border)',
      'not-has-[button]:text-(--ids-color-on-muted)',
      '[&_svg]:shrink-0',
      insetButtons.base,
    ],
    scrollArea: [
      'grow rounded-[inherit]',
      '[:not(:empty)+&]:rounded-t-none [&:has(+:not(:empty))]:rounded-b-none',
    ],
    input: [
      'w-full min-w-0 grow resize-none bg-transparent outline-none',
      'text-inherit placeholder:text-(--ids-color-on-muted)',
      'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
      'disabled:cursor-not-allowed',
      'py-(--ids-text-area-pad-y)',
    ],
    count: [
      'ms-auto shrink-0 text-(--ids-color-on-muted) tabular-nums',
      'data-near-limit:text-(--ids-color-on-surface)',
    ],
  },
  variants: {
    variant: {
      outline: { root: fieldSurface.variant.outline },
      soft: { root: fieldSurface.variant.soft },
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
        input: 'px-3 [--ids-text-area-pad-y:0.5rem]',
        count: 'text-caption-c1-regular',
      },
      tiny: {
        root: 'text-caption-c1-regular',
        bar: [
          'gap-0.5 px-2 py-1 [&_svg]:size-(--ids-size-icon-tiny)',
          insetButtons.size.tiny,
          '[&>:first-child:is(button,:has(button))]:-ms-1 [&>:last-child:is(button,:has(button))]:-me-1',
        ],
        input: 'px-2 [--ids-text-area-pad-y:0.5rem]',
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
        root: 'overflow-visible',
        input: 'min-h-[calc(1lh+var(--ids-text-area-pad-y)*2)]',
      },
      horizontal: { root: 'min-w-24 overflow-visible' },
      both: {
        root: 'min-w-24 overflow-visible',
        input: 'min-h-[calc(1lh+var(--ids-text-area-pad-y)*2)]',
      },
    } satisfies Record<TextAreaResize, object>,
  },
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
    resize: 'none',
  },
});
