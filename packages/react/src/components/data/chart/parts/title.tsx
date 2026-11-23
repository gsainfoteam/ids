'use client';

import { type ComponentProps } from 'react';

import { useInternalChartContext } from '../context';

export type ChartTitleProps = ComponentProps<'div'>;

export function ChartTitle({ className, id, ...props }: ChartTitleProps) {
  const { styles, titleId } = useInternalChartContext('Chart.Title');

  return (
    <div
      {...props}
      id={id ?? titleId}
      data-chart-title=""
      className={styles.title({ className })}
    />
  );
}

ChartTitle.displayName = 'Chart.Title';
