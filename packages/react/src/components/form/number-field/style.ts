import { fieldAction } from '../../../internal/field-surface';
import { textControlStyle } from '../../../internal/text-control/style';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const numberFieldStyle = tv({
  extend: textControlStyle,
  slots: {
    stepper: 'flex shrink-0 flex-col self-center',
    stepButton: [fieldAction.base, 'min-w-0 rounded-indicator px-0 touch-manipulation select-none'],
  },
  variants: {
    size: {
      standard: {
        stepper: 'last:-me-2',
        stepButton: 'h-4 w-6 [&_svg]:size-3',
      },
      tiny: {
        stepper: 'last:-me-1.5',
        stepButton: 'h-3.5 w-5 [&_svg]:size-3',
      },
    } satisfies Record<IdsSize, object>,
  },
});
