import { controlSurface } from '../../../internal/surfaces/control-surface';
import { iconSquare } from '../../../internal/surfaces/icon-square';
import { toggleSurface } from '../../../internal/surfaces/toggle-surface';
import { tv } from '../../../utils';

export const iconToggleStyle = tv({
  base: [controlSurface.base, iconSquare.base],
  variants: {
    variant: toggleSurface.glyphVariant,
    colorScheme: controlSurface.colorScheme,
    size: iconSquare.size,
  },
  compoundVariants: toggleSurface.compoundVariants,
  defaultVariants: {
    variant: 'outline',
    colorScheme: 'primary',
    size: 'standard',
  },
});
