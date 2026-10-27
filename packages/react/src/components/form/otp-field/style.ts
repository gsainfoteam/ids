import { fieldSurface } from '../../../internal/field-surface';
import { cn, tv } from '../../../utils';

import type { OTPFieldVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

const noIosFocusZoom = cn('text-base');

export const otpFieldStyle = tv({
  slots: {
    root: 'group/otp relative inline-flex items-center gap-2 data-disabled:opacity-50',
    input: [
      'absolute inset-0 z-10 size-full cursor-text appearance-none border-0 bg-transparent p-0',
      'font-mono',
      noIosFocusZoom,
      'tracking-[-0.5em] text-transparent caret-transparent outline-none',
      'selection:bg-transparent disabled:cursor-not-allowed',
    ],
    group: 'flex items-center',
    slot: [
      fieldSurface.base,
      'relative flex items-center justify-center',
      'rounded-standard data-grouped:rounded-none',
      'data-grouped:-ms-px data-grouped:first:ms-0',
      'data-grouped:first:rounded-s-standard data-grouped:last:rounded-e-standard',
      'data-focus-visible:z-20',
    ],
    placeholder: 'text-(--ids-color-on-muted)',
    maskDot: 'size-2 rounded-full bg-current',
    separator: 'flex items-center text-(--ids-color-on-muted) [&_svg]:size-4',
    caret: 'pointer-events-none absolute inset-0 flex items-center justify-center',
    caretLine:
      'h-1/2 w-px animate-caret-blink bg-(--ids-color-on-surface) motion-reduce:animate-none',
  },
  variants: {
    variant: {
      outline: { slot: fieldSurface.variant.outline },
      soft: { slot: fieldSurface.variant.soft },
    } satisfies Record<OTPFieldVariant, object>,
    size: {
      standard: { slot: 'size-(--ids-size-control-standard) text-body-b2-medium' },
      tiny: { slot: 'size-(--ids-size-control-tiny) text-body-b3-medium' },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
