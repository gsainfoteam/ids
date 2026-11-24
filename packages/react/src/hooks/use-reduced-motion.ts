'use client';

import { useInternalMediaQuery } from './use-media-query';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export function useInternalReducedMotion() {
  return useInternalMediaQuery(REDUCED_MOTION);
}
