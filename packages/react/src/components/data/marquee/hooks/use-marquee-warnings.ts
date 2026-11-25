'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';
import { isValidSpeed } from '../lib/speed';

import type { Marquee } from '..';

export function useInternalMarqueeWarnings(
  named: boolean,
  speed: NonNullable<Marquee.Props['speed']>,
) {
  useEffect(() => {
    if (!isDevelopment) return;
    if (!named)
      console.warn(
        '[IDS] Marquee: give it an aria-label that says what flows by, such as "Partners".',
      );
    if (!isValidSpeed(speed))
      console.warn('[IDS] Marquee: speed must be a positive number of pixels per second.');
  }, [named, speed]);
}
