import { cn } from '../utils/cn';

import type { IdsVariant } from '../tokens/types';

// A toggle is quiet while off, with only outline drawing a border, and its variant describes the
// pressed look: the neutral hover fill for ghost and outline, the scheme tint for soft, the scheme
// fill for solid. Colors come from the control surface's scheme properties. Sizes are the control
// surface's own, so a Toggle with a label keeps a Button's padding; IconToggle squares itself.
export const toggleSurface = {
  variant: {
    ghost: cn(
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-hover)',
      'data-pressed:bg-(--control-hover)',
    ),
    outline: cn(
      'bg-transparent text-(--control-quiet) shadow-xs inset-ring-1 inset-ring-(--ids-color-border)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-hover)',
      'data-pressed:bg-(--control-hover)',
    ),
    soft: cn(
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-hover)',
      'data-pressed:bg-(--control-fill)/10 data-pressed:text-(--control-accent)',
    ),
    solid: cn(
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover) data-active:bg-(--control-hover)',
      'data-pressed:bg-(--control-fill) data-pressed:text-(--control-on-fill) data-pressed:shadow-xs',
    ),
  } satisfies Record<IdsVariant, string>,
} as const;
