import { cn } from '../utils/cn';

import type { IdsSize } from '../tokens/types';

export const iconSquare = {
  base: cn('shrink-0 gap-0 p-0 rounded-standard [&_svg]:shrink-0'),
  size: {
    standard: cn('size-(--ids-size-control-standard) [&_svg]:size-(--ids-size-icon-standard)'),
    tiny: cn('size-(--ids-size-control-tiny) [&_svg]:size-(--ids-size-icon-tiny)'),
  } satisfies Record<IdsSize, string>,
} as const;
