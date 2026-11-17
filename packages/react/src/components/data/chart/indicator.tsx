'use client';

import { type CSSProperties } from 'react';

import { useChartContext } from './context';

import type { ChartIndicator } from './config';

export function Indicator({ kind, color }: { kind: ChartIndicator; color: string | undefined }) {
  const { styles } = useChartContext('Chart.Indicator');

  return (
    <span
      aria-hidden
      data-chart-indicator={kind}
      className={styles.indicator({ indicator: kind })}
      style={{ '--chart-indicator': color } as CSSProperties}
    />
  );
}
