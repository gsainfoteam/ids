import { tv } from '../../../utils';

export const highlightStyle = tv({
  slots: {
    root: '',
    mark: '-mx-[0.125em] rounded-indicator px-[0.125em] box-decoration-clone',
  },
  variants: {
    variant: {
      soft: { mark: 'bg-(--ids-color-secondary) text-(--ids-color-on-secondary)' },
      solid: { mark: 'bg-(--ids-color-primary) text-(--ids-color-on-primary)' },
    },
  },
  defaultVariants: { variant: 'soft' },
});
