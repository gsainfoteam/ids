'use client';

import { type ComponentProps } from 'react';

import { useInternalChartContext } from '../context';

export type ChartDescriptionProps = ComponentProps<'p'>;

export function ChartDescription({ className, id, ...props }: ChartDescriptionProps) {
  const { styles, descriptionId } = useInternalChartContext('Chart.Description');

  return (
    <p
      {...props}
      id={id ?? descriptionId}
      data-chart-description=""
      className={styles.description({ className })}
    />
  );
}

ChartDescription.displayName = 'Chart.Description';
