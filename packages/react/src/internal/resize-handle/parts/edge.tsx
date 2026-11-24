'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { mergeProps, part } from '../../../utils';
import { useInternalAxisSeparator } from '../hooks/use-resize-axes';
import { resizeEdgeStyle } from '../style';

import type { ResizeBand } from '../lib/arc';
import type { ResizeAxis } from '../lib/axis';

export type ResizeEdgeProps = Omit<ComponentProps<'div'>, 'children'> & {
  axis: ResizeAxis;
  band?: ResizeBand;
  disabled?: boolean;
  onDraggingChange?: (dragging: boolean) => void;
  asChild?: boolean;
  children?: ReactNode;
};

export function ResizeEdge({
  axis,
  band = 'centered',
  disabled = false,
  onDraggingChange,
  asChild = false,
  className,
  children,
  ...props
}: ResizeEdgeProps) {
  const separator = useInternalAxisSeparator(axis, { disabled, onDraggingChange });

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      ...separator,
      'aria-label': props['aria-label'] ?? separator['aria-label'],
      'data-resize-edge': '',
      className: resizeEdgeStyle({ dimension: axis.dimension, band, className }),
    }),
  );
}
