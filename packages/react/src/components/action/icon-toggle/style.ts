import { controlSurface } from '../../../internal/control-surface';
import { iconSquare } from '../../../internal/icon-square';
import { toggleSurface } from '../../../internal/toggle-surface';
import { tv } from '../../../utils';

export const iconToggleStyle = tv({
  base: [controlSurface.base, iconSquare.base],
  variants: {
    variant: toggleSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: iconSquare.size,
  },
  defaultVariants: {
    variant: 'ghost',
    colorScheme: 'primary',
    size: 'standard',
  },
});
