import { cn } from '../../utils/cn';

import type { IdsSize } from '../../tokens/types';

export const segmentSurface = {
  track: cn('concentric-p-1 gap-0.5 bg-neutral-subtle'),
  fit: cn('self-start'),
  segment: cn('rounded-standard'),
  selected: {
    ariaSelected: cn('aria-selected:bg-segment aria-selected:shadow-xs'),
    checked: cn('data-[state=checked]:bg-segment data-[state=checked]:shadow-xs'),
  },
  height: {
    standard: cn('h-[calc(var(--ids-size-control-standard)-0.5rem)]'),
    tiny: cn('h-[calc(var(--ids-size-control-tiny)-0.5rem)]'),
  } satisfies Record<IdsSize, string>,
} as const;
