import { tv } from '../../../utils';

import type { RadioVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const radioStyle = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center justify-center align-middle',
      'rounded-full focus-ring',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
      '[--radio-accent:var(--ids-color-primary)] data-invalid:[--radio-accent:var(--ids-color-danger)]',
      'data-disabled:opacity-50',
    ],
    input:
      'absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-[inherit] opacity-0 disabled:cursor-not-allowed',
    indicator: [
      'pointer-events-none flex shrink-0 items-center justify-center text-(--radio-accent) [&>svg]:size-full',
      'transition-[opacity,scale] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'data-[state=unchecked]:scale-50 data-[state=unchecked]:opacity-0',
    ],
    dot: 'size-full rounded-full bg-current',
  },
  variants: {
    variant: {
      outline: {
        root: 'bg-(--ids-color-surface) shadow-xs inset-ring-1 inset-ring-(--ids-color-border) dark:bg-(--ids-color-muted)/30',
      },
      soft: { root: 'bg-(--ids-color-muted) inset-ring-1 inset-ring-transparent' },
    } satisfies Record<RadioVariant, object>,
    size: {
      standard: { root: 'size-4', indicator: 'size-2' },
      tiny: { root: 'size-3.5', indicator: 'size-1.5' },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
