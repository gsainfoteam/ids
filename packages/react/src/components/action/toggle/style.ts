import { controlSurface } from '../../../internal/control-surface';
import { toggleSurface } from '../../../internal/toggle-surface';
import { tv } from '../../../utils';

export const toggleStyle = tv({
  base: controlSurface.base,
  variants: {
    variant: toggleSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: controlSurface.size,
  },
  defaultVariants: {
    variant: 'ghost',
    colorScheme: 'primary',
    size: 'standard',
  },
});
