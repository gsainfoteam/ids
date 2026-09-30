import { cn } from '../../utils';

export const resizeHandle = {
  base: cn('touch-none select-none outline-none after:absolute'),
  hitArea: {
    vertical: cn('after:inset-y-0 after:left-1/2 after:w-6 after:-translate-x-1/2'),
    horizontal: cn('after:inset-x-0 after:top-1/2 after:h-6 after:-translate-y-1/2'),
    corner: cn('after:top-1/2 after:left-1/2 after:size-6 after:-translate-1/2'),
  },
  cursor: {
    vertical: cn('cursor-ew-resize'),
    horizontal: cn('cursor-ns-resize'),
    corner: cn('cursor-nwse-resize rtl:cursor-nesw-resize'),
  },
  focus: cn('focus-ring'),
  focusWithin: cn('has-focus-visible:ring-[3px] has-focus-visible:ring-(--ids-color-primary)/40'),
  ladder: {
    ink: cn(
      'text-(--ids-color-handle) hover:text-(--ids-color-handle-hover)',
      'data-dragging:text-(--ids-color-handle-active)',
    ),
    pill: cn(
      'before:bg-(--ids-color-handle) hover:before:bg-(--ids-color-handle-hover)',
      'data-dragging:before:bg-(--ids-color-handle-active)',
    ),
  },
  motion: cn(
    'transition-[color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
    'before:transition-colors before:duration-(--ids-motion-fast) motion-reduce:before:transition-none',
  ),
  disabled: cn('data-disabled:pointer-events-none data-disabled:opacity-50'),
};
