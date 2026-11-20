import { textControlStyle } from '../../../internal/text-control/style';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const telFieldStyle = tv({
  extend: textControlStyle,
  slots: {
    country: [
      'w-auto shrink-0 rounded-standard text-neutral-bold',
      'state-layer hover:state-hover active:state-press ring-0! inset-ring-transparent!',
    ],
    countryTrigger: 'gap-1',
    countryValue: 'tabular-nums',
    countryName: 'min-w-0 flex-1 truncate',
    countryCode: 'shrink-0 text-neutral tabular-nums',
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
