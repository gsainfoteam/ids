import type { IdsSize } from '../tokens/types';

// controlSurface trims the padding on the side holding an icon. A square has no padding at all,
// so those same conditional classes are reset here; tailwind-merge only drops the trimmed
// padding when the override uses the identical has-[...] condition.
export const iconSquare = {
  base: [
    'shrink-0 gap-0 px-0 rounded-standard [&_svg]:shrink-0',
    'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-0',
    'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-0',
  ],
  // A Spinner swapped in for the icon is a span around a spinning svg; it takes the icon size too.
  size: {
    standard: [
      'size-(--ids-size-control-standard) [&_svg]:size-(--ids-size-icon-standard)',
      '[&>:has(>svg.animate-spin)]:size-(--ids-size-icon-standard)',
    ],
    tiny: [
      'size-(--ids-size-control-tiny) [&_svg]:size-(--ids-size-icon-tiny)',
      '[&>:has(>svg.animate-spin)]:size-(--ids-size-icon-tiny)',
    ],
  } satisfies Record<IdsSize, string[]>,
} as const;
