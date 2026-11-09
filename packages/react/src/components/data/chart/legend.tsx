'use client';

import { type ReactNode } from 'react';

import {
  Legend,
  type DefaultLegendContentProps,
  type LegendPayload,
  type LegendProps,
} from 'recharts';

import { configOrder, entryFor, type ChartIndicator } from './config';
import { useChartContext } from './context';
import { Indicator } from './indicator';

export type ChartLegendFormatter = (
  label: ReactNode,
  item: LegendPayload,
  index: number,
) => ReactNode;

export type ChartLegendProps = Omit<LegendProps, 'formatter' | 'ref'> & {
  indicator?: ChartIndicator;
  formatter?: ChartLegendFormatter;
};

export type ChartLegendContentProps = Pick<DefaultLegendContentProps, 'payload'> & {
  indicator?: ChartIndicator;
  formatter?: ChartLegendFormatter;
};

export function ChartLegendContent({
  payload,
  indicator = 'dot',
  formatter,
}: ChartLegendContentProps) {
  const { config, styles } = useChartContext('Chart.Legend');
  if (!payload?.length) return null;

  return (
    <ul data-chart-legend="" className={styles.legend()}>
      {payload.map((item, index) => {
        const label: ReactNode =
          entryFor(config, item.value, item.dataKey)?.entry.label ?? item.value;

        return (
          <li
            key={`${String(item.dataKey ?? item.value)}:${index}`}
            data-inactive={item.inactive ? '' : undefined}
            className={styles.legendItem()}
          >
            <Indicator kind={indicator} color={item.color} />
            {formatter ? formatter(label, item, index) : label}
          </li>
        );
      })}
    </ul>
  );
}

ChartLegendContent.displayName = 'Chart.LegendContent';

export function ChartLegend({ indicator, formatter, content, ...props }: ChartLegendProps) {
  const { config } = useChartContext('Chart.Legend');

  return (
    <Legend
      itemSorter={(item) => configOrder(config, item.dataKey, item.value)}
      {...props}
      formatter={formatter}
      content={content ?? <ChartLegendContent indicator={indicator} />}
    />
  );
}

ChartLegend.displayName = 'Chart.Legend';
