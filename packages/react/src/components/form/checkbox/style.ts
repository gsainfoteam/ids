import { tv } from '../../../utils';

import type { CheckboxVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const checkboxStyle = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center justify-center align-middle',
      'rounded-indicator focus-ring',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
      '[--checkbox-accent:var(--ids-color-primary)] [--checkbox-on-accent:var(--ids-color-on-primary)]',
      'data-invalid:[--checkbox-accent:var(--ids-color-danger)] data-invalid:[--checkbox-on-accent:var(--ids-color-on-danger)]',
      'data-[state=checked]:bg-(--checkbox-accent) data-[state=checked]:text-(--checkbox-on-accent) data-[state=checked]:inset-ring-(--checkbox-accent)',
      'data-[state=indeterminate]:bg-(--checkbox-accent) data-[state=indeterminate]:text-(--checkbox-on-accent) data-[state=indeterminate]:inset-ring-(--checkbox-accent)',
      'data-disabled:opacity-50',
    ],
    input:
      'absolute inset-0 m-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed',
    indicator: [
      'pointer-events-none flex shrink-0 items-center justify-center [&>svg]:size-full',
      'transition-[opacity,scale] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'data-[state=unchecked]:scale-50 data-[state=unchecked]:opacity-0',
    ],
  },
  variants: {
    variant: {
      outline: {
        root: 'bg-(--ids-color-surface) shadow-xs inset-ring-1 inset-ring-(--ids-color-border) dark:bg-(--ids-color-muted)/30',
      },
      soft: { root: 'bg-(--ids-color-muted) inset-ring-1 inset-ring-transparent' },
    } satisfies Record<CheckboxVariant, object>,
    size: {
      standard: { root: 'size-4', indicator: 'size-3.5' },
      tiny: { root: 'size-3.5', indicator: 'size-3' },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
