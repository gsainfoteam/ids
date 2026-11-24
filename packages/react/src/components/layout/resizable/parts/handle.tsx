'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { ResizeEdge, ResizeGrip } from '../../../../internal/resize-handle';
import { useInternalResizableContext } from '../context';

export type ResizableHandleProps = Omit<ComponentProps<'div'>, 'children'> & {
  asChild?: boolean;
  children?: ReactNode;
};

export function ResizableHandle(props: ResizableHandleProps) {
  const c = useInternalResizableContext('Resizable.Handle');
  const handle = {
    ...props,
    disabled: c.disabled,
    onDraggingChange: c.onDraggingChange,
    'data-resizable-handle': '',
  };

  if (c.direction === 'both')
    return <ResizeGrip {...handle} axes={[c.axes.width, c.axes.height]} corner={c.element} />;

  return (
    <ResizeEdge {...handle} axis={c.direction === 'horizontal' ? c.axes.width : c.axes.height} />
  );
}

ResizableHandle.displayName = 'Resizable.Handle';
