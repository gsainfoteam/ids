'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { resizeEdgeStyle } from './style';
import { useAxisSeparator } from './use-resize-axes';
import { mergeProps, part } from '../../utils';

import type { ResizeBand } from './arc';
import type { ResizeAxis } from './axis';

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
  const separator = useAxisSeparator(axis, { disabled, onDraggingChange });

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
