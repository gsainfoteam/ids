'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Resizable } from '.';
import type { ResizeAxis } from '../../../internal/resize-handle';

type ResizableContextValue = {
  direction: Resizable.Direction;
  disabled: boolean;
  element: HTMLElement | null;
  axes: Record<'width' | 'height', ResizeAxis>;
  onDraggingChange: (dragging: boolean) => void;
};

export const ResizableContext = createContext<ResizableContextValue | null>(null);

export function useResizableContext(part: string) {
  const context = use(ResizableContext);
  invariant(context, `${part} must be rendered inside Resizable.`);
  return context;
}
