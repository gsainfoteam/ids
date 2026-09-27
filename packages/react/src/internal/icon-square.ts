import type { IdsSize } from '../tokens/types';

// controlSurface trims the padding on the side holding an icon. A square has no padding at all,
// so those same conditional classes are reset here; tailwind-merge only drops the trimmed
// padding when the override uses the identical has-[...] condition.
export const iconSquare = {
  base: [
    'shrink-0 gap-0 px-0 [&_svg]:shrink-0',
    'has-[>svg:first-child]:ps-0 has-[>svg:last-child]:pe-0',
  ],
  size: {
    standard: 'size-(--ids-size-control-standard) [&_svg]:size-(--ids-size-icon-standard)',
    tiny: 'size-(--ids-size-control-tiny) [&_svg]:size-(--ids-size-icon-tiny)',
  } satisfies Record<IdsSize, string>,
} as const;
