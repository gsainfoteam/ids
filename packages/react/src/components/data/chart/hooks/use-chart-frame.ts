'use client';

import { useRef } from 'react';

import { useInternalChartSize } from './use-chart-size';
import { useInternalKeysOverARestingPointer } from './use-keys-over-a-resting-pointer';

export function useInternalChartFrame() {
  const frameRef = useRef<HTMLDivElement>(null);
  const size = useInternalChartSize(frameRef);
  const keysOverARestingPointer = useInternalKeysOverARestingPointer(frameRef);

  return { frameRef, size, keysOverARestingPointer };
}
