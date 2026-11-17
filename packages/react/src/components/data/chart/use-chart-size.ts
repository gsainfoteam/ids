'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

export type ChartSize = { width: number; height: number };

const sizeOf = (element: HTMLElement): ChartSize | null => {
  const { width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0 ? { width: Math.floor(width), height: Math.floor(height) } : null;
};

const sameSize = (a: ChartSize | null, b: ChartSize | null) =>
  a?.width === b?.width && a?.height === b?.height;

export function useChartSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<ChartSize | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const next = sizeOf(element);
      setSize((current) => (sameSize(current, next) ? current : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
