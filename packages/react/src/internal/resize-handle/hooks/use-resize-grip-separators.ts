'use client';

import { useRef, useState, type KeyboardEvent } from 'react';

import { flushSync } from 'react-dom';

import { axisKeyMap, readingDirection } from './use-resize-axes';
import { keyHandler, type KeyMap } from '../../lib/keys';

import type { ResizeAxis, ResizeDimension } from '../lib/axis';

export function useInternalResizeGripSeparators(
  axes: readonly [ResizeAxis, ResizeAxis],
  disabled: boolean,
) {
  const [focusedAxis, setFocusedAxis] = useState<ResizeDimension>(axes[0].dimension);
  const separators = useRef(new Map<ResizeDimension, HTMLElement>());

  const resizeAndFocus = (axis: ResizeAxis) => (size: number) => {
    flushSync(() => {
      axis.resize(size);
      setFocusedAxis(axis.dimension);
    });
    separators.current.get(axis.dimension)?.focus();
  };

  const keysOn = (focused: ResizeAxis): KeyMap<HTMLElement> => ({
    ...Object.assign(
      {},
      ...axes
        .filter((axis) => axis !== focused)
        .map((axis) => axisKeyMap(axis, resizeAndFocus(axis))),
    ),
    ...axisKeyMap(focused, resizeAndFocus(focused)),
    Enter: () => {
      for (const axis of axes) axis.reset();
    },
  });

  return (axis: ResizeAxis) => ({
    ref: (node: HTMLDivElement | null) => {
      if (node) separators.current.set(axis.dimension, node);
      return () => {
        separators.current.delete(axis.dimension);
      };
    },
    tabIndex: disabled ? undefined : axis.dimension === focusedAxis ? 0 : -1,
    onFocus: () => setFocusedAxis(axis.dimension),
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      if (!disabled) keyHandler(keysOn(axis), readingDirection(event.currentTarget))(event);
    },
  });
}
