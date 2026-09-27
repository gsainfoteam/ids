import type { IdsSize, IdsVariant } from '../tokens/types';

// A toggle is quiet while off, with only outline drawing a border, and its variant describes the
// pressed look: the neutral hover fill for ghost and outline, the scheme tint for soft, the scheme
// fill for solid. Colors come from the control surface's scheme properties.
export const toggleSurface = {
  size: {
    standard: [
      'h-(--ids-size-control-standard) min-w-(--ids-size-control-standard) rounded-standard px-2 text-button-standard',
      "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
    ],
    tiny: [
      'h-(--ids-size-control-tiny) min-w-(--ids-size-control-tiny) gap-1.5 rounded-standard px-1.5 text-button-tiny',
      "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-tiny)",
    ],
  } satisfies Record<IdsSize, string[]>,
  variant: {
    ghost: [
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-hover)',
      'data-pressed:bg-(--control-hover)',
    ],
    outline: [
      'bg-transparent text-(--control-quiet) shadow-xs inset-ring-1 inset-ring-(--ids-color-border)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-hover)',
      'data-pressed:bg-(--control-hover)',
    ],
    soft: [
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-hover)',
      'data-pressed:bg-(--control-fill)/10 data-pressed:text-(--control-accent)',
    ],
    solid: [
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-hover)',
      'data-pressed:bg-(--control-fill) data-pressed:text-(--control-on-fill) data-pressed:shadow-xs',
    ],
  } satisfies Record<IdsVariant, string[]>,
} as const;
