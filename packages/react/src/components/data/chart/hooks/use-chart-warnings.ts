'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';
import { DEFAULT_SERIES } from '../lib/config';

const WRAPPED_CHART_WARNING =
  '[IDS] Chart: its chart child is not a Recharts chart, so Chart cannot paint its series or add the screen reader table. Place the Recharts chart as a direct child, or place Chart.Table yourself.';

const tooManySeriesWarning = (count: number) =>
  `[IDS] Chart: ${count} series have no color, but the default colors are only ${DEFAULT_SERIES.join(', ')}, so the rest draw in neutral. Give the 4th and later series a color in the config.`;

export function useInternalChartWarnings({
  wrapsAnUnknownChart,
  uncoloredSeries,
}: {
  wrapsAnUnknownChart: boolean;
  uncoloredSeries: number;
}) {
  useEffect(() => {
    if (isDevelopment && wrapsAnUnknownChart) console.warn(WRAPPED_CHART_WARNING);
  }, [wrapsAnUnknownChart]);

  useEffect(() => {
    if (isDevelopment && uncoloredSeries > DEFAULT_SERIES.length)
      console.warn(tooManySeriesWarning(uncoloredSeries));
  }, [uncoloredSeries]);
}
