import { controlSurface } from '../../../internal/control-surface';
import { iconSquare } from '../../../internal/icon-square';
import { tv } from '../../../utils';

export const iconButtonStyle = tv({
  base: [controlSurface.base, iconSquare.base],
  variants: {
    variant: controlSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: iconSquare.size,
  },
  defaultVariants: {
    variant: 'ghost',
    colorScheme: 'primary',
    size: 'standard',
  },
});
