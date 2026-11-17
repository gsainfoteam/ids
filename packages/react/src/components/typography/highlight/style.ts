import { tv } from '../../../utils';

export const highlightStyle = tv({
  slots: {
    root: '',
    mark: '-mx-[0.125em] rounded-indicator px-[0.125em] box-decoration-clone',
  },
  variants: {
    variant: {
      soft: { mark: 'bg-primary-soft text-on-primary-soft' },
      solid: { mark: 'bg-primary text-on-primary' },
    },
  },
  defaultVariants: { variant: 'soft' },
});
