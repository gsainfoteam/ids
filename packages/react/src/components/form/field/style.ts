import { tv } from '../../../utils';

import type { FieldOrientation } from './context';
import type { IdsSize } from '../../../tokens/types';

export const fieldStyle = tv({
  slots: {
    root: 'grid min-w-0 gap-x-3 gap-y-2',
    description: 'text-(--ids-color-on-muted)',
    hint: 'text-(--ids-color-on-muted)',
    error: 'text-(--ids-color-danger)',
    control: 'min-w-0 [&>input:not([type=checkbox]):not([type=radio])]:w-full [&>textarea]:w-full',
  },
  variants: {
    size: {
      standard: { root: 'text-body-b3-regular' },
      tiny: { root: 'text-caption-c1-regular' },
    } satisfies Record<IdsSize, object>,
    orientation: {
      vertical: {},
      horizontal: {
        root: 'grid-cols-[auto_minmax(0,1fr)] [&>:not([data-field-part=label])]:col-start-2 [&>[data-field-part=label]]:col-start-1 [&>[data-field-part=label]]:self-center',
      },
    } satisfies Record<FieldOrientation, object>,
    described: { true: {}, false: {} },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      described: true,
      class: { root: '[&>[data-field-part=label]]:row-start-2' },
    },
    {
      orientation: 'horizontal',
      described: false,
      class: { root: '[&>[data-field-part=label]]:row-start-1' },
    },
  ],
  defaultVariants: { size: 'standard', orientation: 'vertical' },
});
