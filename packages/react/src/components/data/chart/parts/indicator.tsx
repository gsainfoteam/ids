'use client';

import { type CSSProperties } from 'react';

import { useInternalChartContext } from '../context';

import type { ChartIndicator } from '../lib/config';

export function Indicator({ kind, color }: { kind: ChartIndicator; color: string | undefined }) {
  const { styles } = useInternalChartContext('Chart.Indicator');

  return (
    <span
      aria-hidden
      data-chart-indicator={kind}
      className={styles.indicator({ indicator: kind })}
      style={{ '--chart-indicator': color } as CSSProperties}
    />
  );
}
