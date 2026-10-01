import { resizeHandle } from '../../../internal/resize-handle';
import { tv } from '../../../utils';

import type { SplitterOrientation } from './use-splitter';

export type SplitterToggleSide = 'center' | 'before' | 'after';

export const splitterStyle = tv({
  slots: {
    root: 'flex size-full min-h-0 min-w-0',
    panel: 'min-h-0 min-w-0 basis-0 overflow-hidden data-dragging:pointer-events-none',
    handle: [
      resizeHandle.base,
      resizeHandle.focus,
      resizeHandle.ladder.line,
      'relative z-10 shrink-0 self-stretch',
      'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
    ],
    group: 'relative z-10 flex shrink-0',
    toggle: [
      'absolute z-20 flex size-6 cursor-pointer items-center justify-center rounded-full',
      'bg-(--ids-color-surface) text-(--ids-color-on-muted) shadow-xs inset-ring-1 inset-ring-(--ids-color-border)',
      'hover:bg-(--ids-color-muted) hover:text-(--ids-color-on-surface) active:bg-(--ids-color-muted-hover)',
      'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
      'focus-ring',
    ],
    toggleIcon: 'pointer-events-none size-3.5',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'flex-row',
        handle: [resizeHandle.hitArea.vertical, resizeHandle.cursor.vertical, 'w-px'],
        group: 'flex-row',
        toggle: 'top-2',
        toggleIcon: 'rtl:-scale-x-100',
      },
      vertical: {
        root: 'flex-col',
        handle: [resizeHandle.hitArea.horizontal, resizeHandle.cursor.horizontal, 'h-px'],
        group: 'flex-col',
        toggle: 'start-2',
      },
    } satisfies Record<SplitterOrientation, object>,
    side: { center: {}, before: {}, after: {} } satisfies Record<SplitterToggleSide, object>,
  },
  compoundVariants: [
    { orientation: 'horizontal', side: 'center', class: { toggle: 'left-1/2 -translate-x-1/2' } },
    { orientation: 'horizontal', side: 'before', class: { toggle: 'end-full' } },
    { orientation: 'horizontal', side: 'after', class: { toggle: 'start-full' } },
    { orientation: 'vertical', side: 'center', class: { toggle: 'top-1/2 -translate-y-1/2' } },
    { orientation: 'vertical', side: 'before', class: { toggle: 'bottom-full' } },
    { orientation: 'vertical', side: 'after', class: { toggle: 'top-full' } },
  ],
  defaultVariants: { orientation: 'horizontal', side: 'center' },
});
