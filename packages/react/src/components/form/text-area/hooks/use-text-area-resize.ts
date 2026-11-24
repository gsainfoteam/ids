'use client';

import { useState } from 'react';

import {
  useInternalMeasuredAxes,
  type ResizeAxis,
  type ResizeDimension,
} from '../../../../internal/resize-handle';

import type { TextAreaHandle } from './use-text-area';

export type UseTextAreaResizeOptions = {
  resize: TextAreaHandle;
  disabled: boolean;
  shellId: string;
  inputId: string;
};

const RESIZES: Record<TextAreaHandle, readonly ResizeDimension[]> = {
  none: [],
  vertical: ['height'],
  horizontal: ['width'],
  both: ['width', 'height'],
};

export function useInternalTextAreaResize({
  resize,
  disabled,
  shellId,
  inputId,
}: UseTextAreaResizeOptions) {
  const [shell, setShell] = useState<HTMLElement | null>(null);
  const [input, setInput] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const dimensions = RESIZES[resize];
  const resizesWidth = dimensions.includes('width');
  const resizesHeight = dimensions.includes('height');
  const measured = useInternalMeasuredAxes({
    width: resizesWidth ? shell : null,
    height: resizesHeight ? input : null,
  });

  const axisOf = (dimension: ResizeDimension): ResizeAxis => {
    const [target, size, setSize, controls] =
      dimension === 'width'
        ? [shell, width, setWidth, shellId]
        : [input, height, setHeight, inputId];

    return {
      dimension,
      target,
      size: size ?? measured[dimension]?.size,
      min: measured[dimension]?.min ?? 0,
      max: measured[dimension]?.max ?? Infinity,
      controls,
      resize: setSize,
      reset: () => setSize(undefined),
    };
  };

  return {
    axes: dimensions.map(axisOf),
    disabled,
    shell,
    shellId: resizesWidth ? shellId : undefined,
    width: resizesWidth ? width : undefined,
    height: resizesHeight ? height : undefined,
    setShell,
    setInput,
  };
}
