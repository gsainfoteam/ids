import { cn, tv } from '../../../utils';

const cornerOfThePaddedViewport = cn('concentric-p-6 p-0');

export const dialogStyle = tv({
  slots: {
    backdrop: [
      'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none border-0 p-0',
      'bg-black/50 transition-opacity duration-(--ids-motion-normal) ease-out',
      'starting:opacity-0 data-ending-style:opacity-0 data-stacked:bg-transparent',
      'motion-reduce:transition-none',
    ],
    content: [
      'fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm flex-col outline-none',
      cornerOfThePaddedViewport,
      'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface) shadow-lg',
      'transition-[opacity,scale] duration-(--ids-motion-normal) ease-out',
      'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      'data-nested-open:scale-[0.96] motion-reduce:transition-none',
    ],
    viewport: 'relative flex flex-col gap-4 p-6',
    header: 'flex flex-col gap-1.5 pe-8 text-start',
    title: 'text-subtitle-s1-semibold [overflow-wrap:anywhere]',
    description: 'text-body-b3-regular text-(--ids-color-on-muted)',
    footer: 'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
    close: 'absolute end-4 top-4',
  },
});
