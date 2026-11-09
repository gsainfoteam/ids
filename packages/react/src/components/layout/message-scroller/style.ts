import { tv } from '../../../utils';

export const messageScrollerStyle = tv({
  slots: {
    root: 'relative flex min-h-0 min-w-0 flex-col [contain:layout]',
    area: 'min-h-0 flex-1 rounded-[inherit]',
    viewport: '[overflow-anchor:none]',
    list: 'flex flex-col gap-4 p-4',
    item: 'flex min-w-0 flex-col',
    loader: 'pointer-events-none absolute inset-x-0 top-3 flex justify-center',
    loaderSurface: [
      'flex rounded-full bg-(--ids-color-surface) p-1.5 shadow-md',
      'inset-ring-1 inset-ring-(--ids-color-border)',
    ],
    scrollToBottom: [
      'transition-[color,background-color,box-shadow,scale,opacity]',
      'data-hidden:pointer-events-none data-hidden:scale-90 data-hidden:opacity-0',
      'motion-reduce:transition-none',
    ],
  },
});
