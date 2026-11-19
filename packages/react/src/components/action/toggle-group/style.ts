import { tv } from '../../../utils';

export const toggleGroupStyle = tv({
  variants: {
    orientation: { horizontal: '', vertical: '' },
    attached: { true: '', false: '' },
  },
  compoundVariants: [
    { orientation: 'horizontal', attached: true, class: '[&>[data-toggle-group-item]]:flex-1' },
  ],
  defaultVariants: { orientation: 'horizontal', attached: true },
});
