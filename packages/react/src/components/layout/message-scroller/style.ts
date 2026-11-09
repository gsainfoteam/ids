import { tv } from '../../../utils';

export const messageScrollerStyle = tv({
  slots: {
    root: 'relative flex min-h-0 min-w-0 flex-col',
    area: 'min-h-0 flex-1 rounded-[inherit]',
    viewport: '[overflow-anchor:none]',
    list: 'flex flex-col gap-4 p-4',
    item: 'flex min-w-0 flex-col',
    loader: 'pointer-events-none absolute inset-x-0 top-3 flex justify-center',
    loaderSurface: 'concentric-p-2 shadow-md',
    jump: [
      'absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full shadow-md',
      'transition-[color,background-color,box-shadow,scale,opacity,translate]',
      'data-hidden:pointer-events-none data-hidden:translate-y-2 data-hidden:scale-95 data-hidden:opacity-0',
      'motion-reduce:transition-none',
    ],
  },
  variants: {
    opaque: {
      true: { jump: 'dark:bg-(--ids-color-surface)' },
    },
    iconOnly: {
      true: {
        jump: [
          'aspect-square px-0',
          'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-0',
          'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-0',
        ],
      },
    },
  },
});
