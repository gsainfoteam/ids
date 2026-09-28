import { listStyles } from '../../../internal/list-styles';
import { cn, tv } from '../../../utils';

const cornerOfThePaddedViewport = cn('concentric-p-1 p-0');

export const menuStyle = tv({
  slots: {
    content: [
      'fixed z-50 m-0 flex max-h-(--available-height) max-w-(--available-width) flex-col outline-none',
      cornerOfThePaddedViewport,
      'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface)',
      'text-body-b3-regular shadow-md',
      'transition-[opacity,scale] duration-(--ids-motion-fast) ease-out',
      'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      'data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom',
      'motion-reduce:transition-none',
    ],
    viewport: 'flex flex-col p-1',
    palette: [
      'fixed inset-x-0 top-[15vh] bottom-auto z-50 mx-auto my-0 flex h-fit flex-col',
      'max-h-[min(28rem,calc(85dvh-1rem))] w-[min(36rem,calc(100%-2rem))] max-w-none',
      'overflow-hidden concentric-p-1 outline-none',
      'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface)',
      'text-body-b3-regular shadow-lg',
      'origin-top transition-[opacity,scale] duration-(--ids-motion-fast) ease-out',
      'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      'motion-reduce:transition-none',
    ],
    backdrop: [
      'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none border-0 p-0',
      'bg-black/50 transition-opacity duration-(--ids-motion-fast) ease-out',
      'starting:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none',
    ],
    listArea: listStyles.listArea,
    list: listStyles.list,
    empty: [listStyles.empty, 'not-data-empty:sr-only'],
    item: [
      listStyles.option,
      'pe-2.5 data-popup-open:bg-(--ids-color-muted) [&_svg]:size-(--ids-size-icon-standard)',
    ],
    indicator: listStyles.indicator,
    dot: 'size-1.5 rounded-full bg-current',
    chevron: '-me-0.5 ms-auto text-(--ids-color-on-muted)',
    group: 'flex flex-col',
    label: listStyles.heading,
    separator: listStyles.separator,
    shortcut: 'ms-auto ps-3',
  },
  variants: {
    nested: {
      false: { content: 'min-w-[max(var(--anchor-width),8rem)]' },
      true: { content: 'min-w-32' },
    },
    checkable: {
      true: { item: 'pe-8' },
    },
  },
  defaultVariants: { nested: false },
});
