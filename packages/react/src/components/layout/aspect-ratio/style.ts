import { tv } from '../../../utils';

export const aspectRatioStyle = tv({
  slots: {
    root: 'relative w-full',
    content: [
      'absolute inset-0 min-h-0 min-w-0',
      '[:where(&>*)]:size-full [:where(&>img,&>video)]:object-cover',
    ],
  },
});
