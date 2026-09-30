import { cn, tv } from '../../utils';

import type { ResizeBand } from './arc';
import type { ResizeDimension } from './axis';

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

export const resizeEdgeStyle = tv({
  base: [
    resizeHandle.base,
    resizeHandle.focus,
    resizeHandle.ladder.pill,
    resizeHandle.motion,
    resizeHandle.disabled,
    'absolute z-10 rounded-full',
    'before:absolute before:top-1/2 before:left-1/2 before:-translate-1/2 before:rounded-full',
  ],
  variants: {
    dimension: {
      width: [resizeHandle.cursor.vertical, 'inset-y-0 -end-px w-0.5 before:h-8 before:w-1'],
      height: [resizeHandle.cursor.horizontal, 'inset-x-0 -bottom-px h-0.5 before:h-1 before:w-8'],
    } satisfies Record<ResizeDimension, string[]>,
    band: { centered: '', outward: '' } satisfies Record<ResizeBand, string>,
  },
  compoundVariants: [
    { dimension: 'width', band: 'centered', class: resizeHandle.hitArea.vertical },
    { dimension: 'height', band: 'centered', class: resizeHandle.hitArea.horizontal },
    { dimension: 'width', band: 'outward', class: 'after:inset-y-0 after:-start-px after:w-6' },
    { dimension: 'height', band: 'outward', class: 'after:inset-x-0 after:-top-px after:h-6' },
  ],
  defaultVariants: { band: 'centered' },
});

export const resizeGripStyle = tv({
  slots: {
    grip: [
      resizeHandle.base,
      resizeHandle.ladder.ink,
      resizeHandle.motion,
      'group/grip absolute end-0 bottom-0 z-10 data-disabled:opacity-50',
    ],
    drawing: 'pointer-events-none absolute overflow-visible rtl:-scale-x-100',
    halo: ['stroke-(--ids-color-primary)/40 opacity-0', 'group-has-focus-visible/grip:opacity-100'],
    arc: ['stroke-current', 'group-has-focus-visible/grip:stroke-(--ids-color-primary)'],
    target: [resizeHandle.cursor.corner, 'group-data-disabled/grip:pointer-events-none'],
    separator: 'sr-only',
  },
  variants: {
    custom: {
      true: {
        grip: [
          resizeHandle.hitArea.corner,
          resizeHandle.cursor.corner,
          resizeHandle.focusWithin,
          resizeHandle.disabled,
          'm-1 flex size-4 items-center justify-center rounded-indicator',
        ],
      },
      false: { grip: 'pointer-events-none' },
    },
  },
  defaultVariants: { custom: false },
});
