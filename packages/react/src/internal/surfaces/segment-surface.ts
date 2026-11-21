import { cn } from '../../utils/cn';

import type { IdsSize } from '../../tokens/types';

export const segmentSurface = {
  track: cn('concentric-p-1 gap-0.5 bg-neutral-subtle'),
  segment: cn(
    'rounded-standard text-neutral data-selected:text-neutral-bold',
    'data-selected:bg-segment data-selected:shadow-xs',
    'state-layer not-data-selected:data-hovered:state-hover',
    'not-data-selected:data-active:state-press',
  ),
  height: {
    standard: cn('h-[calc(var(--ids-size-control-standard)-0.5rem)]'),
    tiny: cn('h-[calc(var(--ids-size-control-tiny)-0.5rem)]'),
  } satisfies Record<IdsSize, string>,
} as const;
