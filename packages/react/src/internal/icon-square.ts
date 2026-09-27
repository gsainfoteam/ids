import type { IdsSize } from '../tokens/types';

// An icon-only control is exactly as wide as it is tall. It is composed from the control surface's
// base and variants but never its sizes, whose padding and icon-side trims would break the square.
// A Spinner swapped in for the icon is a span around a spinning svg; it takes the icon size too.
export const iconSquare = {
  base: 'shrink-0 gap-0 p-0 rounded-standard [&_svg]:shrink-0',
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
