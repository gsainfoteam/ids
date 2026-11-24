'use client';

import { useState } from 'react';

import { flushSync } from 'react-dom';

import {
  measureAxis,
  useInternalMeasuredAxes,
  type ResizeAxis,
  type ResizeDimension,
} from '../../../../internal/resize-handle';

import type { ResizableInstance } from './use-resizable';

export function useInternalResizableElement(instance: ResizableInstance, controls: string) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const measured = useInternalMeasuredAxes({ width: element, height: element });

  const axisOf = (dimension: ResizeDimension): ResizeAxis => {
    const { size, setSize, resetTo, min, max, onValueChange } = instance[dimension];
    const { getValueLabel } = instance;

    return {
      dimension,
      target: element,
      size: size ?? measured[dimension]?.size,
      min,
      max,
      controls,
      step: instance.step,
      valueLabel: getValueLabel && ((value) => getValueLabel(value, dimension)),
      resize: (next) => setSize(next),
      reset: () => {
        if (resetTo !== undefined) return setSize(resetTo);
        if (size === undefined || !element) return;

        flushSync(() => setSize(undefined, { silent: true }));
        onValueChange?.(measureAxis(element, dimension).size);
      },
    };
  };

  return {
    element,
    setElement,
    width: instance.width.size,
    height: instance.height.size,
    axes: { width: axisOf('width'), height: axisOf('height') },
  };
}
