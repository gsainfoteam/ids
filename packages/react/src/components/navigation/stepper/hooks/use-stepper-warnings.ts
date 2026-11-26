'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

import type { StepsName } from '../context';

export function useInternalStepperRangeWarning(current: number, count: number) {
  useEffect(() => {
    if (!isDevelopment) return;
    if (current < 0 || current > count)
      console.warn(
        `[IDS] Stepper: value=${current} is outside the ${count} steps (0 to ${count}, where ${count} means every step is completed).`,
      );
  }, [current, count]);
}

export function useInternalStrayStepWarning(name: StepsName, allowed: string, strayCount: number) {
  useEffect(() => {
    if (!isDevelopment || strayCount === 0) return;
    console.warn(
      `[IDS] ${name}: only ${allowed} can be children. A step wrapped in your own component is not counted; render ${name}.Item directly.`,
    );
  }, [name, allowed, strayCount]);
}
