import { tv } from '../../../utils';

export const resizableStyle = tv({
  slots: {
    root: 'relative',
  },
  variants: {
    asChild: {
      false: { root: 'size-full min-h-0 min-w-0' },
      true: {},
    },
  },
});
