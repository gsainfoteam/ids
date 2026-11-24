import {
  controlSurface,
  neutralKeepsThePrimaryRing,
  quietInStatusColor,
  statusSchemes,
  type ControlCompoundVariant,
  type SurfaceVariant,
} from './control-surface';
import { cn } from '../../../utils/cn';

import type { IdsVariant } from '../../../tokens/types';

const toggleStates = cn(
  'state-layer not-data-pressed:data-hovered:state-hover data-active:state-press',
);

const pressedShowsThePressLayer = cn('data-pressed:state-press');

const variant = {
  ghost: cn('bg-transparent text-neutral-strong', toggleStates, pressedShowsThePressLayer),
  outline: cn(
    'bg-transparent text-neutral-strong shadow-xs inset-ring-1 inset-ring-neutral',
    toggleStates,
    pressedShowsThePressLayer,
  ),
  soft: cn(
    'bg-transparent text-neutral-strong',
    'state-layer data-hovered:state-hover data-active:state-press',
    'data-pressed:bg-scheme-soft data-pressed:text-on-scheme-soft data-pressed:state-scheme',
  ),
  solid: cn(
    'bg-transparent text-neutral-strong',
    'state-layer data-hovered:state-hover data-active:state-press',
    'data-pressed:bg-scheme-solid data-pressed:text-on-scheme-solid data-pressed:shadow-xs',
    'data-pressed:state-fill',
  ),
  glossy: cn(
    'bg-transparent text-neutral-strong',
    'state-layer data-hovered:state-hover data-active:state-press',
    'data-pressed:bg-scheme-solid data-pressed:text-on-scheme-solid data-pressed:shadow-sm',
    'data-pressed:bg-linear-to-b data-pressed:from-white/20 data-pressed:to-transparent',
    'data-pressed:inset-shadow-[0_1px_0_rgb(255_255_255/0.35)]',
    'data-pressed:inset-ring-1 data-pressed:inset-ring-black/20',
  ),
} satisfies Record<SurfaceVariant, string>;

const compoundVariants: ControlCompoundVariant<SurfaceVariant>[] = [
  neutralKeepsThePrimaryRing,
  {
    colorScheme: statusSchemes,
    variant: ['ghost', 'outline', 'soft', 'solid', 'glossy'],
    class: quietInStatusColor,
  },
];

export const toggleSurface = {
  variant,
  glyphVariant: {
    ...variant,
    transparent: cn(
      controlSurface.variant.transparent,
      'text-neutral-strong data-pressed:text-scheme',
      'data-pressed-hovered:opacity-70 data-pressed-active:opacity-40',
    ),
  } satisfies Record<IdsVariant, string>,
  compoundVariants,
} as const;
