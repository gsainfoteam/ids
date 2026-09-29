import { tv } from '../../../utils';

export const tooltipStyle = tv({
  slots: {
    content: [
      'pointer-events-none fixed z-50 m-0 w-max max-w-xs overflow-visible border-0',
      'rounded-standard px-2.5 py-1.5 text-start text-caption-c1-medium break-keep [overflow-wrap:anywhere]',
      'bg-(--ids-color-on-surface) text-(--ids-color-surface) shadow-md',
      'transition-[opacity,scale] duration-(--ids-motion-fast) ease-out',
      'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      'data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom',
      'data-instant:transition-none motion-reduce:transition-none',
    ],
    arrow: 'absolute size-2 rotate-45 bg-inherit',
  },
});
