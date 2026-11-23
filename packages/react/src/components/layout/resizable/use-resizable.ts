'use client';

import { useState } from 'react';

import { flushSync } from 'react-dom';

import { useControllableState } from '../../../hooks/use-controllable-state';
import {
  measureAxis,
  useMeasuredAxes,
  type ResizeAxis,
  type ResizeDimension,
} from '../../../internal/resize-handle';

type SizeOptions = {
  value: number | undefined;
  defaultValue: number | undefined;
  onChange: ((size: number) => void) | undefined;
  declared: { min: number | undefined; max: number | undefined };
};

export type UseResizableOptions = {
  width: SizeOptions;
  height: SizeOptions;
  step: number | undefined;
  getValueLabel: ((size: number, dimension: ResizeDimension) => string) | undefined;
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

export function useResizable({
  width,
  height,
  step,
  getValueLabel,
  controls,
}: UseResizableOptions) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const sizes = { width: useSize(width), height: useSize(height) };
  const measured = useMeasuredAxes({ width: element, height: element });

  const axisOf = (dimension: ResizeDimension, options: SizeOptions): ResizeAxis => {
    const { size, setSize, resetTo } = sizes[dimension];
    const drawn = measured[dimension];

    return {
      dimension,
      target: element,
      size: size ?? drawn?.size,
      min: drawn?.min ?? options.declared.min ?? 0,
      max: drawn?.max ?? options.declared.max ?? Infinity,
      controls,
      step,
      valueLabel: getValueLabel && ((value) => getValueLabel(value, dimension)),
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
