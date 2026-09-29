import { cn, tv } from '../../../utils';

const cornerOfThePaddedViewport = cn('concentric-p-6 p-0');

export const drawerStyle = tv({
  slots: {
    backdrop: [
      'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none touch-none border-0 p-0',
      'bg-black/50 opacity-[var(--drawer-fade,1)]',
      'transition-opacity duration-(--ids-motion-slow) ease-[cubic-bezier(0.32,0.72,0,1)]',
      'starting:opacity-0 data-ending-style:opacity-0 data-stacked:bg-transparent',
      'data-dragging:transition-none motion-reduce:transition-none',
    ],
    content: [
      'fixed z-50 m-0 flex flex-col outline-none',
      cornerOfThePaddedViewport,
      'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface) shadow-lg',
      'transition-[translate,transform,scale] duration-(--ids-motion-slow) ease-[cubic-bezier(0.32,0.72,0,1)]',
      'data-nested-open:scale-(--drawer-nested-scale)',
      'data-dragging:transition-none data-dragging:select-none motion-reduce:transition-none',
    ],
    viewport: 'relative flex flex-col gap-4 p-6',
    handle: [
      'relative shrink-0 cursor-grab touch-none rounded-full outline-none focus-ring',
      'before:absolute before:-inset-3',
      'bg-(--ids-color-handle) transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
      'hover:bg-(--ids-color-handle-hover) data-dragging:bg-(--ids-color-handle-active)',
    ],
    header: 'flex flex-col gap-1.5 pe-8 text-start',
    title: 'text-subtitle-s1-semibold [overflow-wrap:anywhere]',
    description: 'text-body-b3-regular text-(--ids-color-on-muted)',
    footer: 'mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
    close: 'absolute end-4 top-4',
  },
  variants: {
    side: {
      bottom: {
        content: [
          'inset-x-0 top-auto bottom-0 h-fit max-h-[calc(100%-2rem)] w-full max-w-none',
          'data-[side=bottom]:rounded-b-none data-[side=bottom]:border-b-0',
          'starting:translate-y-full data-ending-style:translate-y-full data-nested-open:-translate-y-4',
        ],
        viewport: 'pb-[calc(--spacing(6)+env(safe-area-inset-bottom))]',
        handle: 'order-first mx-auto -mt-2 h-1.5 w-12',
      },
      top: {
        content: [
          'inset-x-0 top-0 bottom-auto h-fit max-h-[calc(100%-2rem)] w-full max-w-none',
          'data-[side=top]:rounded-t-none data-[side=top]:border-t-0',
          'starting:-translate-y-full data-ending-style:-translate-y-full data-nested-open:translate-y-4',
        ],
        viewport: 'pt-[calc(--spacing(6)+env(safe-area-inset-top))]',
        handle: 'order-last mx-auto -mb-2 h-1.5 w-12',
      },
      right: {
        content: [
          'inset-y-0 right-0 left-auto h-full max-h-none w-[min(24rem,calc(100%-2rem))]',
          'data-[side=right]:rounded-r-none data-[side=right]:border-r-0',
          'starting:translate-x-full data-ending-style:translate-x-full data-nested-open:-translate-x-4',
        ],
        handle: 'absolute top-1/2 left-2 h-12 w-1.5 -translate-y-1/2',
      },
      left: {
        content: [
          'inset-y-0 right-auto left-0 h-full max-h-none w-[min(24rem,calc(100%-2rem))]',
          'data-[side=left]:rounded-l-none data-[side=left]:border-l-0',
          'starting:-translate-x-full data-ending-style:-translate-x-full data-nested-open:translate-x-4',
        ],
        handle: 'absolute top-1/2 right-2 h-12 w-1.5 -translate-y-1/2',
      },
    },
    snapping: { true: {}, false: {} },
  },
  compoundVariants: [
    { side: ['top', 'bottom'], snapping: true, class: { content: 'h-[calc(100%-2rem)]' } },
    {
      side: ['left', 'right'],
      snapping: true,
      class: { content: 'w-[calc(100%-2rem)]' },
    },
  ],
  defaultVariants: { side: 'right', snapping: false },
});
