import { controlSurface } from '../../../internal/surfaces/control-surface';
import { toggleSurface } from '../../../internal/surfaces/toggle-surface';
import { tv } from '../../../utils';

export const toggleStyle = tv({
  base: controlSurface.base,
  variants: {
    variant: toggleSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: controlSurface.size,
  },
  compoundVariants: toggleSurface.compoundVariants,
  defaultVariants: {
    variant: 'outline',
    colorScheme: 'primary',
    size: 'standard',
  },
});
