import type { IdsSize } from '../tokens/types';

export const iconSquare = {
  base: 'shrink-0 gap-0 [&_svg]:shrink-0 data-active:scale-[0.96]',
  size: {
    standard: 'size-11 px-0 [&_svg]:size-5',
    tiny: 'size-8 px-0 [&_svg]:size-4',
  } satisfies Record<IdsSize, string>,
} as const;
