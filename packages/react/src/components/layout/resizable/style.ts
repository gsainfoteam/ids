import { resizeHandle } from '../../../internal/resize-handle';
import { tv } from '../../../utils';

import type { Resizable } from '.';

export const resizableStyle = tv({
  slots: {
    root: 'relative',
    handle: [
      resizeHandle.base,
      resizeHandle.focus,
      resizeHandle.ladder.pill,
      resizeHandle.motion,
      resizeHandle.disabled,
      'absolute z-10 rounded-full',
      'before:absolute before:top-1/2 before:left-1/2 before:-translate-1/2 before:rounded-full',
    ],
    grip: 'absolute end-1 bottom-1 z-10',
  },
  variants: {
    direction: {
      horizontal: {
        handle: [
          resizeHandle.hitArea.vertical,
          resizeHandle.cursor.vertical,
          'inset-y-0 -end-px w-0.5 before:h-8 before:w-1',
        ],
      },
      vertical: {
        handle: [
          resizeHandle.hitArea.horizontal,
          resizeHandle.cursor.horizontal,
          'inset-x-0 -bottom-px h-0.5 before:h-1 before:w-8',
        ],
      },
      both: {},
    } satisfies Record<Resizable.Direction, object>,
  },
  defaultVariants: { direction: 'both' },
});
