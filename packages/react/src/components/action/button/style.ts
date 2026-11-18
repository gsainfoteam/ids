import { controlSurface } from '../../../internal/surfaces/control-surface';
import { tv } from '../../../utils';

export const buttonStyle = tv({
  base: controlSurface.base,
  variants: {
    variant: controlSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: controlSurface.size,
  },
  compoundVariants: controlSurface.compoundVariants,
  defaultVariants: {
    variant: 'solid',
    colorScheme: 'primary',
    size: 'standard',
  },
});
