import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const kbdStyle = tv({
  slots: {
    root: [
      'relative inline-flex w-fit shrink-0 items-center justify-center before:self-end',
      'rounded-indicator bg-current/10 font-sans text-current/75 select-none',
    ],
    face: 'inline-flex items-center gap-0.5',
    group: 'inline-flex items-center gap-1',
    glyph: 'shrink-0',
    separator: 'text-current/60 select-none',
  },
  variants: {
    size: {
      standard: {
        root: 'h-5 min-w-5 px-1 align-[calc(0.5cap-10px)]',
        face: 'text-caption-c1-medium',
        group: 'align-[calc(0.5cap-10px)]',
        glyph: 'size-3!',
        separator: 'text-caption-c1-regular',
      },
      tiny: {
        root: 'h-4 min-w-4 px-0.5 align-[calc(0.5cap-8px)]',
        face: 'text-caption-c2-medium',
        group: 'align-[calc(0.5cap-8px)]',
        glyph: 'size-2.5!',
        separator: 'text-caption-c2-regular',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { size: 'standard' },
});
