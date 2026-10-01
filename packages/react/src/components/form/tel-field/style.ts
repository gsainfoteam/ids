import { textControlStyle } from '../../../internal/text-control/style';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const telFieldStyle = tv({
  extend: textControlStyle,
  slots: {
    country: [
      'w-auto shrink-0 rounded-standard text-(--ids-color-on-surface)',
      'hover:bg-(--ids-color-muted) active:bg-(--ids-color-muted-hover) ring-0! inset-ring-transparent!',
    ],
    countryTrigger: 'gap-1',
    countryValue: 'tabular-nums',
    countryName: 'min-w-0 flex-1 truncate',
    countryCode: 'shrink-0 text-(--ids-color-on-muted) tabular-nums',
  },
  variants: {
    size: {
      standard: {
        country: 'h-7 first:-ms-2 last:-me-2',
        countryTrigger: 'px-2',
      },
      tiny: {
        country: 'h-6 first:-ms-1.5 last:-me-1.5',
        countryTrigger: 'px-1.5',
      },
    } satisfies Record<IdsSize, object>,
  },
});
