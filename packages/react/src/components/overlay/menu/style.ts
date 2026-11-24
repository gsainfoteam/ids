import { listStyles } from '../../../internal/lib/list-styles';
import { overlayStyles } from '../../../internal/overlay/lib/styles';
import { tv } from '../../../utils';

export const menuStyle = tv({
  slots: {
    content: [
      overlayStyles.popup,
      'max-h-(--available-height) max-w-(--available-width)',
      'transition-[opacity,scale] duration-(--ids-motion-fast) ease-out',
      'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      'data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom',
      'motion-reduce:transition-none',
    ],
    viewport: 'flex flex-col p-1',
    palette: [
      'fixed inset-x-0 top-[15vh] bottom-auto z-50 mx-auto my-0 flex h-fit flex-col',
      'max-h-[min(--spacing(112),calc(85dvh-var(--spacing)*4))] w-[min(--spacing(144),calc(100%-var(--spacing)*8))] max-w-none',
      'overflow-hidden concentric-p-1 outline-none',
      'border border-neutral bg-surface text-neutral-strong',
      'text-body-b3-regular shadow-lg',
      'origin-top transition-[opacity,scale] duration-(--ids-motion-fast) ease-out',
      'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      'motion-reduce:transition-none',
    ],
    backdrop: [overlayStyles.backdrop, 'duration-(--ids-motion-fast) ease-out'],
    listArea: listStyles.listArea,
    list: listStyles.list,
    empty: [listStyles.empty, 'not-data-empty:sr-only'],
    item: [
      listStyles.option,
      'pe-2.5 data-popup-open:state-hover [&_svg]:size-(--ids-size-icon-standard)',
    ],
    indicator: listStyles.indicator,
    dot: 'size-1.5 rounded-full bg-current',
    chevron: '-me-0.5 ms-auto text-neutral',
    group: 'flex flex-col',
    label: listStyles.heading,
    separator: listStyles.separator,
    shortcut: 'ms-auto ps-3',
  },
  variants: {
    nested: {
      false: { content: 'min-w-[max(var(--anchor-width),--spacing(32))]' },
      true: { content: 'min-w-32' },
    },
    checkable: {
      true: { item: 'pe-8' },
    },
  },
  defaultVariants: { nested: false },
});
