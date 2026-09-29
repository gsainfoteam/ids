import { tv } from '../../../utils';

export const toggleGroupStyle = tv({
  variants: {
    orientation: {
      horizontal: '[&>[data-toggle-group-item]]:flex-1',
      vertical: '',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});
