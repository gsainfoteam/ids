import { fieldAction } from '../../../internal/surfaces/field-surface';
import { textControlStyle } from '../../../internal/text-control/style';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const passwordFieldStyle = tv({
  extend: textControlStyle,
  slots: {
    toggle: [fieldAction.base, 'data-pressed:bg-transparent'],
    capsLock: 'inline-flex shrink-0 items-center text-neutral',
  },
  variants: {
    size: {
      standard: {
        toggle: fieldAction.padded.standard,
        capsLock: '[&_svg]:size-(--ids-size-icon-standard)',
      },
      tiny: {
        toggle: fieldAction.padded.tiny,
        capsLock: '[&_svg]:size-(--ids-size-icon-tiny)',
      },
    } satisfies Record<IdsSize, object>,
  },
});
