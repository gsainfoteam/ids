import { controlSurface } from '../../../internal/surfaces/control-surface';
import { iconSquare } from '../../../internal/surfaces/icon-square';
import { tv } from '../../../utils';

export const iconButtonStyle = tv({
  base: [controlSurface.base, iconSquare.base],
  variants: {
    variant: controlSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: iconSquare.size,
  },
  compoundVariants: controlSurface.compoundVariants,
  defaultVariants: {
    variant: 'ghost',
    colorScheme: 'primary',
    size: 'standard',
  },
});
