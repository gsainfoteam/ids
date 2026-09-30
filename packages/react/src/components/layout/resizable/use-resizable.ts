'use client';

import { useEffect, useState } from 'react';

import { flushSync } from 'react-dom';

import { useControllableState } from '../../../hooks/use-controllable-state';
import {
  measureAxis,
  useMeasuredAxes,
  type ResizeAxis,
  type ResizeDimension,
} from '../../../internal/resize-handle';
import { isDevelopment } from '../../../utils/dev';

type SizeOptions = {
  value: number | undefined;
  defaultValue: number | undefined;
  onChange: ((size: number) => void) | undefined;
  min: number;
  max: number;
};

export type UseResizableOptions = {
  width: SizeOptions;
  height: SizeOptions;
  controls: string;
};

function useSize({ value, defaultValue, onChange }: SizeOptions) {
  const [size, setSize] = useControllableState<number | undefined>({
    value,
    defaultValue,
    onValueChange: onChange as ((size: number | undefined) => void) | undefined,
  });
  const [resetTo] = useState(defaultValue ?? value);

  return { size, setSize, resetTo };
}

function useWarnWhenBoundsCross(dimension: ResizeDimension, min: number, max: number) {
  useEffect(() => {
    if (isDevelopment && min > max)
      console.warn(
        `[IDS] Resizable: the minimum ${dimension} (${min}px) is greater than the maximum (${max}px); the maximum wins.`,
      );
  }, [dimension, min, max]);
}

export function useResizable({ width, height, controls }: UseResizableOptions) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const sizes = { width: useSize(width), height: useSize(height) };
  const measured = useMeasuredAxes({ width: element, height: element });

  useWarnWhenBoundsCross('width', width.min, width.max);
  useWarnWhenBoundsCross('height', height.min, height.max);

  const axisOf = (dimension: ResizeDimension, options: SizeOptions): ResizeAxis => {
    const { size, setSize, resetTo } = sizes[dimension];
    const drawn = measured[dimension];

    return {
      dimension,
      target: element,
      size: size ?? drawn?.size,
      min: Math.max(options.min, drawn?.min ?? 0),
      max: Math.min(options.max, drawn?.max ?? Infinity),
      controls,
      resize: (next) => setSize(next),
      reset: () => {
        if (resetTo !== undefined) return setSize(resetTo);
        if (size === undefined || !element) return;

        flushSync(() => setSize(undefined, { silent: true }));
        options.onChange?.(measureAxis(element, dimension).size);
      },
    };
  };

  return {
    element,
    setElement,
    width: sizes.width.size,
    height: sizes.height.size,
    axes: { width: axisOf('width', width), height: axisOf('height', height) },
  };
}
