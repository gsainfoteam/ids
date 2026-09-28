import { cn, tv } from '../../utils';

const borderOptionsCannotCover = cn('border border-(--ids-color-border)');
const cornerOfThePaddedViewport = cn('concentric-p-1 p-0');

export const popupStyle = tv({
  slots: {
    popup: [
      'fixed z-50 m-0 flex flex-col',
      cornerOfThePaddedViewport,
      borderOptionsCannotCover,
      'bg-(--ids-color-surface) text-(--ids-color-on-surface)',
      'text-body-b3-regular shadow-md outline-none',
      'transition-[opacity,scale,translate] duration-(--ids-motion-fast) ease-out',
      'motion-reduce:transition-none',
    ],
    viewport: 'flex flex-col overscroll-contain p-1 [overflow-anchor:none]',
    backdrop: [
      'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none touch-none overflow-hidden border-0 p-0',
      'bg-black/50 transition-opacity duration-(--ids-motion-normal) starting:opacity-0',
      'motion-reduce:transition-none',
    ],
    header:
      '-mt-1 mb-2 hidden items-center justify-between ps-1 in-data-[presentation=drawer]:flex',
    title: 'text-body-b3-medium',
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
