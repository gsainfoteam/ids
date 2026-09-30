'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Resizable } from '.';
import type { resizableStyle } from './style';
import type { ResizeAxis } from '../../../internal/resize-handle';

type ResizableContextValue = {
  direction: Resizable.Direction;
  disabled: boolean;
  axes: Record<'width' | 'height', ResizeAxis>;
  styles: ReturnType<typeof resizableStyle>;
  onDraggingChange: (dragging: boolean) => void;
};

export const ResizableContext = createContext<ResizableContextValue | null>(null);

export function useResizableContext(part: string) {
  const context = use(ResizableContext);
  invariant(context, `${part} must be rendered inside Resizable.`);
  return context;
}
