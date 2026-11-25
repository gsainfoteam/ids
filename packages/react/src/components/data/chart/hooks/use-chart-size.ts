'use client';

import { useState, type RefObject } from 'react';

import { useInternalResizeObserver } from '../../../../hooks/use-resize-observer';

export type ChartSize = { width: number; height: number };

const sizeOf = (element: HTMLElement): ChartSize | null => {
  const { width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0 ? { width: Math.floor(width), height: Math.floor(height) } : null;
};

const sameSize = (a: ChartSize | null, b: ChartSize | null) =>
  a?.width === b?.width && a?.height === b?.height;

export function useInternalChartSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<ChartSize | null>(null);

  useInternalResizeObserver(ref, (element) => {
    const next = sizeOf(element);
    setSize((current) => (sameSize(current, next) ? current : next));
  });

  return size;
}
