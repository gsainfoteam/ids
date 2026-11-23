'use client';

import { useEffect, useState } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { isDevelopment } from '../../../utils/dev';

import type { ResizeDimension } from '../../../internal/resize-handle';

export type ResizableAxisOptions = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (size: number) => void;
  min?: number;
  max?: number;
};

export type UseResizableOptions = {
  width?: ResizableAxisOptions;
  height?: ResizableAxisOptions;
  step?: number;
  getValueLabel?: (size: number, dimension: ResizeDimension) => string;
};

export type ResizableAxis = {
  size: number | undefined;
  setSize: (size: number | undefined, options?: { silent?: boolean }) => void;
  resetTo: number | undefined;
  min: number;
  max: number;
  onValueChange: ((size: number) => void) | undefined;
};

export type ResizableInstance = {
  width: ResizableAxis;
  height: ResizableAxis;
  step: number | undefined;
  getValueLabel: ((size: number, dimension: ResizeDimension) => string) | undefined;
};

function useWarnWhenBoundsCross(dimension: ResizeDimension, min: number, max: number) {
  useEffect(() => {
    if (isDevelopment && min > max)
      console.warn(
        `[IDS] Resizable: the minimum ${dimension} (${min}px) is greater than the maximum (${max}px); the maximum wins.`,
      );
  }, [dimension, min, max]);
}

function useAxis(
  dimension: ResizeDimension,
  { value, defaultValue, onValueChange, min = 0, max = Infinity }: ResizableAxisOptions = {},
): ResizableAxis {
  const [size, setSize] = useControllableState<number | undefined>({
    value,
    defaultValue,
    onValueChange: onValueChange as ((size: number | undefined) => void) | undefined,
  });
  const [resetTo] = useState(defaultValue ?? value);

  useWarnWhenBoundsCross(dimension, min, max);

  return { size, setSize, resetTo, min, max, onValueChange };
}

export function useResizable({
  width,
  height,
  step,
  getValueLabel,
}: UseResizableOptions = {}): ResizableInstance {
  return {
    width: useAxis('width', width),
    height: useAxis('height', height),
    step,
    getValueLabel,
  };
}
