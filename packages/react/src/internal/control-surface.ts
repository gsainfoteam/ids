import type { IdsSize, IdsVariant } from '../tokens/types';

export type ControlColorScheme = 'primary' | 'neutral' | 'danger' | 'success' | 'warning' | 'info';

// A color scheme only sets custom properties and every variant reads them, so the four variants
// follow any scheme without one class per variant and scheme pair:
//   --control-fill     solid background, and the tint of soft
//   --control-on-fill  text on the solid fill
//   --control-accent   soft text; status schemes use their -strong shade, which stays legible on a tint
//   --control-quiet    outline and ghost text: neutral for primary and neutral, the scheme otherwise
//   --control-hover    outline and ghost hover fill: muted, or a tint of the status color
//   --control-ring     focus ring and focused border
const schemes = {
  primary: [
    '[--control-fill:var(--ids-color-primary)] [--control-on-fill:var(--ids-color-on-primary)]',
    '[--control-accent:var(--ids-color-primary)] [--control-quiet:var(--ids-color-on-surface)]',
    '[--control-hover:var(--ids-color-muted)] [--control-ring:var(--ids-color-primary)]',
  ],
  neutral: [
    '[--control-fill:var(--ids-color-on-surface)] [--control-on-fill:var(--ids-color-surface)]',
    '[--control-accent:var(--ids-color-on-surface)] [--control-quiet:var(--ids-color-on-surface)]',
    '[--control-hover:var(--ids-color-muted)] [--control-ring:var(--ids-color-primary)]',
  ],
  danger: [
    '[--control-fill:var(--ids-color-danger)] [--control-on-fill:var(--ids-color-on-danger)]',
    '[--control-accent:var(--ids-color-danger-strong)] [--control-quiet:var(--ids-color-danger-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-danger)_10%,transparent)] [--control-ring:var(--ids-color-danger)]',
  ],
  success: [
    '[--control-fill:var(--ids-color-success)] [--control-on-fill:var(--ids-color-on-success)]',
    '[--control-accent:var(--ids-color-success-strong)] [--control-quiet:var(--ids-color-success-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-success)_10%,transparent)] [--control-ring:var(--ids-color-success)]',
  ],
  warning: [
    '[--control-fill:var(--ids-color-warning)] [--control-on-fill:var(--ids-color-on-warning)]',
    '[--control-accent:var(--ids-color-warning-strong)] [--control-quiet:var(--ids-color-warning-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-warning)_10%,transparent)] [--control-ring:var(--ids-color-warning)]',
  ],
  info: [
    '[--control-fill:var(--ids-color-info)] [--control-on-fill:var(--ids-color-on-info)]',
    '[--control-accent:var(--ids-color-info-strong)] [--control-quiet:var(--ids-color-info-strong)]',
    '[--control-hover:color-mix(in_oklab,var(--ids-color-info)_10%,transparent)] [--control-ring:var(--ids-color-info)]',
  ],
} satisfies Record<ControlColorScheme, string[]>;

// Only solid and soft carry the scheme color. Outline and ghost stay neutral for primary, with the
// brand left to focus, the way shadcn/ui keeps secondary actions quiet next to one primary action.
export const controlSurface = {
  base: [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap select-none touch-manipulation',
    'transition-[color,background-color,border-color,box-shadow] duration-(--ids-motion-fast)',
    'cursor-pointer data-disabled:cursor-not-allowed data-disabled:opacity-50',
    'focus-ring',
    // focus-ring colors the ring primary; these run later in the cascade and follow the scheme.
    'focus-visible:ring-(--control-ring)/40 data-focus-visible:ring-(--control-ring)/40',
    'focus-visible:inset-ring-(--control-ring) data-focus-visible:inset-ring-(--control-ring)',
    'motion-reduce:transition-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    // A component that exposes no colorScheme still needs every property defined.
    schemes.primary,
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
      'bg-(--control-fill) text-(--control-on-fill) shadow-xs',
      'data-hovered:bg-(--control-fill)/90',
      'data-active:bg-(--control-fill)/80 data-pressed:bg-(--control-fill)/80',
    ],
    soft: [
      'bg-(--control-fill)/10 text-(--control-accent)',
      'data-hovered:bg-(--control-fill)/15',
      'data-active:bg-(--control-fill)/20 data-pressed:bg-(--control-fill)/20',
    ],
    outline: [
      'bg-(--ids-color-surface) text-(--control-quiet) shadow-xs',
      'inset-ring-1 inset-ring-(--ids-color-border) dark:bg-(--ids-color-muted)/30',
      'data-hovered:bg-(--control-hover)',
      'data-active:bg-(--control-hover) data-pressed:bg-(--control-hover)',
      'data-pressed:inset-ring-(--ids-color-on-muted)/40',
    ],
    ghost: [
      'bg-transparent text-(--control-quiet)',
      'data-hovered:bg-(--control-hover)',
      'data-active:bg-(--control-hover) data-pressed:bg-(--control-hover)',
    ],
  } satisfies Record<IdsVariant, string[]>,
  colorScheme: schemes,
} as const;
