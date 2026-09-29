import { controlSurface } from '../../../internal/control-surface';
import { tv } from '../../../utils';

export const buttonStyle = tv({
  base: controlSurface.base,
  variants: {
    variant: controlSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: controlSurface.size,
  },
  defaultVariants: {
    variant: 'solid',
    colorScheme: 'primary',
    size: 'standard',
  },
});
