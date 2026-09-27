import type { IdsSize, IdsVariant } from '../tokens/types';

// Only solid and soft carry the theme color. Outline and ghost stay neutral, with the brand left
// to focus, the way shadcn/ui keeps secondary actions quiet next to one primary action.
export const controlSurface = {
  base: [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap select-none touch-manipulation',
    'transition-[color,background-color,border-color,box-shadow] duration-(--ids-motion-fast)',
    'cursor-pointer data-disabled:cursor-not-allowed data-disabled:opacity-50',
    'focus-ring',
    'motion-reduce:transition-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  // An icon next to a label already adds visual weight at that edge, so the padding on the side
  // holding the icon shrinks. Icons without an explicit size follow the control's icon token.
  size: {
    standard: [
      'h-(--ids-size-control-standard) rounded-standard px-4 text-button-standard',
      'has-[>svg:first-child]:ps-3 has-[>svg:last-child]:pe-3',
      "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
    ],
    tiny: [
      'h-(--ids-size-control-tiny) gap-1.5 rounded-standard px-3 text-button-tiny',
      'has-[>svg:first-child]:ps-2.5 has-[>svg:last-child]:pe-2.5',
      "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-tiny)",
    ],
  } satisfies Record<IdsSize, string[]>,
  variant: {
    solid: [
      'bg-(--ids-color-primary) text-(--ids-color-on-primary) shadow-xs',
      'data-hovered:bg-(--ids-color-primary)/90',
      'data-active:bg-(--ids-color-primary)/80 data-pressed:bg-(--ids-color-primary)/80',
    ],
    soft: [
      'bg-(--ids-color-primary)/10 text-(--ids-color-primary)',
      'data-hovered:bg-(--ids-color-primary)/15',
      'data-active:bg-(--ids-color-primary)/20 data-pressed:bg-(--ids-color-primary)/20',
    ],
    outline: [
      'bg-(--ids-color-surface) text-(--ids-color-on-surface) shadow-xs',
      'inset-ring-1 inset-ring-(--ids-color-border) dark:bg-(--ids-color-muted)/30',
      'data-hovered:bg-(--ids-color-muted)',
      'data-active:bg-(--ids-color-muted) data-pressed:bg-(--ids-color-muted)',
      'data-pressed:inset-ring-(--ids-color-on-muted)/40',
    ],
    ghost: [
      'bg-transparent text-(--ids-color-on-surface)',
      'data-hovered:bg-(--ids-color-muted)',
      'data-active:bg-(--ids-color-muted) data-pressed:bg-(--ids-color-muted)',
    ],
  } satisfies Record<IdsVariant, string[]>,
} as const;
