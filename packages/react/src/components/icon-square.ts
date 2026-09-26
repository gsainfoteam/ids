import type { IdsSize } from '../tokens/types';

export const iconSquare = {
  base: 'shrink-0 gap-0 [&_svg]:shrink-0',
  size: {
    standard: 'size-(--ids-size-control-standard) px-0 [&_svg]:size-(--ids-size-icon-standard)',
    tiny: 'size-(--ids-size-control-tiny) px-0 [&_svg]:size-(--ids-size-icon-tiny)',
  } satisfies Record<IdsSize, string>,
} as const;
