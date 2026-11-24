'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';
import { sameSize } from '../lib/layout';

const FEWEST_PANELS = 2;
const WHOLE = 100;

const warn = (message: string | false) => {
  if (isDevelopment && message) console.warn(`[IDS] ${message}`);
};

type SplitterWarnings = { panelCount: number; defaultTotal: number; stray: number };

export function useInternalSplitterWarnings({ panelCount, defaultTotal, stray }: SplitterWarnings) {
  const tooFewPanels =
    panelCount < FEWEST_PANELS &&
    `Splitter needs at least two Splitter.Panel children; it has ${panelCount}.`;
  const defaultsPastWhole =
    defaultTotal > WHOLE &&
    !sameSize(defaultTotal, WHOLE) &&
    `Splitter: the default sizes add up to ${defaultTotal}%, past 100%. They are scaled down to fit.`;
  const strayHandles =
    stray > 0 &&
    `Splitter: ${stray} Splitter.Handle not drawn. A handle goes between two panels, one per gap.`;

  useEffect(() => warn(tooFewPanels), [tooFewPanels]);
  useEffect(() => warn(defaultsPastWhole), [defaultsPastWhole]);
  useEffect(() => warn(strayHandles), [strayHandles]);
}
