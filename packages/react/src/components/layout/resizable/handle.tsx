'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useResizableContext } from './context';
import { ResizeGrip, useAxisSeparator, type ResizeAxis } from '../../../internal/resize-handle';
import { mergeProps, part } from '../../../utils';

export type ResizableHandleProps = Omit<ComponentProps<'div'>, 'children'> & {
  asChild?: boolean;
  children?: ReactNode;
};

function EdgeHandle({
  axis,
  asChild = false,
  className,
  children,
  ...props
}: ResizableHandleProps & { axis: ResizeAxis }) {
  const c = useResizableContext('Resizable.Handle');
  const separator = useAxisSeparator(axis, {
    disabled: c.disabled,
    onDraggingChange: c.onDraggingChange,
  });

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      ...separator,
      'aria-label': props['aria-label'] ?? separator['aria-label'],
      'data-resizable-handle': '',
      className: c.styles.handle({ className }),
    }),
  );
}

export function ResizableHandle({ className, ...props }: ResizableHandleProps) {
  const c = useResizableContext('Resizable.Handle');

  if (c.direction === 'both')
    return (
      <ResizeGrip
        {...props}
        axes={[c.axes.width, c.axes.height]}
        disabled={c.disabled}
        onDraggingChange={c.onDraggingChange}
        data-resizable-handle=""
        className={c.styles.grip({ className })}
      />
    );

  const axis = c.direction === 'horizontal' ? c.axes.width : c.axes.height;
  return <EdgeHandle {...props} axis={axis} className={className} />;
}

ResizableHandle.displayName = 'Resizable.Handle';
