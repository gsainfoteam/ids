import { cn, tv } from '../../utils';

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
    line: cn(
      'bg-(--ids-color-border) hover:bg-(--ids-color-handle-hover)',
      'data-dragging:bg-(--ids-color-handle-active)',
    ),
  },
  motion: cn(
    'transition-[color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
    'before:transition-colors before:duration-(--ids-motion-fast) motion-reduce:before:transition-none',
  ),
  disabled: cn('data-disabled:pointer-events-none data-disabled:opacity-50'),
};

export const resizeGripStyle = tv({
  slots: {
    grip: [
      resizeHandle.base,
      resizeHandle.ladder.ink,
      resizeHandle.motion,
      'group/grip relative shrink-0 data-disabled:opacity-50',
    ],
    drawing: 'pointer-events-none absolute overflow-visible rtl:-scale-x-100',
    halo: [
      'stroke-(--ids-color-primary)/40 opacity-0',
      'group-focus-visible/grip:opacity-100 group-has-focus-visible/grip:opacity-100',
    ],
    arc: [
      'stroke-current',
      'group-focus-visible/grip:stroke-(--ids-color-primary)',
      'group-has-focus-visible/grip:stroke-(--ids-color-primary)',
    ],
    target: 'group-data-disabled/grip:pointer-events-none',
    separator: 'sr-only',
  },
  variants: {
    axes: {
      inline: { target: resizeHandle.cursor.vertical },
      block: { target: resizeHandle.cursor.horizontal },
      both: { target: resizeHandle.cursor.corner },
    },
    custom: {
      true: {
        grip: [
          resizeHandle.hitArea.corner,
          resizeHandle.disabled,
          'm-1 flex size-4 items-center justify-center rounded-indicator',
        ],
      },
      false: { grip: 'pointer-events-none' },
    },
  },
  compoundVariants: [
    {
      custom: true,
      axes: 'inline',
      class: { grip: [resizeHandle.cursor.vertical, resizeHandle.focus] },
    },
    {
      custom: true,
      axes: 'block',
      class: { grip: [resizeHandle.cursor.horizontal, resizeHandle.focus] },
    },
    {
      custom: true,
      axes: 'both',
      class: { grip: [resizeHandle.cursor.corner, resizeHandle.focusWithin] },
    },
  ],
  defaultVariants: { axes: 'both', custom: false },
});
