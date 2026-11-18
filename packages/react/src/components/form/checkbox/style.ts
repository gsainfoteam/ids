import { tv } from '../../../utils';

import type { CheckboxVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const checkboxStyle = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center justify-center align-middle',
      'rounded-indicator focus-ring',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'scheme-primary data-invalid:scheme-danger',
      'data-[state=checked]:bg-scheme data-[state=checked]:text-on-scheme data-[state=checked]:inset-ring-(--ids-color-bg-scheme)',
      'data-[state=indeterminate]:bg-scheme data-[state=indeterminate]:text-on-scheme data-[state=indeterminate]:inset-ring-(--ids-color-bg-scheme)',
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
        root: 'bg-control-outline shadow-xs inset-ring-1 inset-ring-control-outline',
      },
      soft: { root: 'bg-neutral-subtle inset-ring-1 inset-ring-transparent' },
    } satisfies Record<CheckboxVariant, object>,
    size: {
      standard: { root: 'size-4', indicator: 'size-3.5' },
      tiny: { root: 'size-3.5', indicator: 'size-3' },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
