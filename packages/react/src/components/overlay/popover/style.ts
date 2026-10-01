import { cn, tv } from '../../../utils';

const cornerOfThePaddedViewport = cn('concentric-p-3 p-0');

export const popoverStyle = tv({
  slots: {
    backdrop: 'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none border-0 bg-transparent p-0',
    content: [
      'fixed z-50 m-0 flex max-h-(--available-height) w-72 max-w-[calc(100vw-1rem)] flex-col overflow-visible outline-none',
      cornerOfThePaddedViewport,
      'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface)',
      'text-body-b3-regular shadow-md',
      'transition-[opacity,scale] duration-(--ids-motion-fast) ease-out',
      'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      'data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom',
      'motion-reduce:transition-none',
    ],
    scrollArea: 'min-h-0 rounded-[inherit]',
    viewport: 'flex flex-col gap-2 p-3',
    title: 'text-body-b3-semibold [overflow-wrap:anywhere]',
    description: 'text-body-b3-regular text-(--ids-color-on-muted)',
  },
});
