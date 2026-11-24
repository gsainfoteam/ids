import { tv } from '../../utils';
import { overlayStyles } from '../overlay/styles';

export const popupStyle = tv({
  slots: {
    popup: [
      overlayStyles.popup,
      'transition-[opacity,scale,translate] duration-(--ids-motion-fast) ease-out',
      'motion-reduce:transition-none',
    ],
    viewport: 'flex flex-col p-1 [overflow-anchor:none]',
    backdrop: [overlayStyles.backdrop, 'touch-none overflow-hidden duration-(--ids-motion-normal)'],
    header: '-mt-1 mb-2 hidden items-center justify-end in-data-[presentation=drawer]:flex',
  },
  variants: {
    presentation: {
      popover: {
        popup: [
          'starting:scale-95 starting:opacity-0',
          'data-[side=bottom]:origin-top data-[side=top]:origin-bottom',
        ],
      },
      drawer: {
        popup: 'shadow-lg duration-(--ids-motion-normal) starting:translate-y-4 starting:opacity-0',
      },
    },
  },
  defaultVariants: { presentation: 'popover' },
});
