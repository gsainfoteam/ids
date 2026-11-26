'use client';

import { useEffect, useState } from 'react';

import { isDevelopment } from '../../../../utils/dev';

import type { SliderValue } from './use-slider-state';

export function useInternalSliderValueShape(first: SliderValue | undefined) {
  const [range] = useState(() => Array.isArray(first));

  const drifted = first !== undefined && Array.isArray(first) !== range;
  useEffect(() => {
    if (isDevelopment && drifted)
      console.warn(
        `[IDS] Slider: the value changed from ${range ? '[start, end]' : 'a number'} to ${range ? 'a number' : '[start, end]'}. A Slider keeps the shape of its first value; give it a new key to switch.`,
      );
  }, [drifted, range]);

  return range;
}
