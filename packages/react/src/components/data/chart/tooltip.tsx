'use client';

import { isValidElement, type ReactNode } from 'react';

import {
  Tooltip,
  type TooltipContentProps,
  type TooltipPayloadEntry,
  type TooltipProps,
} from 'recharts';

import { configOrder, entryFor, type ChartIndicator } from './config';
import { useChartContext } from './context';
import { Indicator } from './indicator';
import { useFormatValue } from './use-format-value';

export type ChartTooltipProps = TooltipProps & {
  indicator?: ChartIndicator;
  hideLabel?: boolean;
};

export type ChartTooltipContentProps = Partial<TooltipContentProps> & {
  indicator?: ChartIndicator;
  hideLabel?: boolean;
};

type Row = { fill?: unknown };

const colorOf = (item: TooltipPayloadEntry) =>
  item.color ?? (item.payload as Row | undefined)?.fill?.toString() ?? item.fill?.toString();

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = 'dot',
  hideLabel = false,
  formatter,
  labelFormatter,
}: ChartTooltipContentProps) {
  const { config, styles, locale } = useChartContext('Chart.Tooltip');
  const format = useFormatValue(locale);
  if (!active || !payload?.length) return null;

  const labelText: ReactNode = entryFor(config, label)?.entry.label ?? label;
  const heading = labelFormatter ? labelFormatter(labelText, payload) : labelText;

  return (
    <div data-chart-tooltip="" className={styles.tooltip()}>
      {!hideLabel && heading !== undefined && heading !== '' && (
        <p className={styles.tooltipLabel()}>{heading}</p>
      )}
      <dl className={styles.tooltipList()}>
        {payload.map((item, index) => {
          const name: ReactNode =
            entryFor(config, item.name, item.dataKey)?.entry.label ?? item.name;
          const formatted = formatter?.(item.value, item.name, item, index, payload);
          const [value, shownName] =
            Array.isArray(formatted) && !isValidElement(formatted)
              ? (formatted as [ReactNode, ReactNode])
              : [formatted ?? format(item.value), name];

          return (
            <div key={`${String(item.dataKey)}:${index}`} className={styles.tooltipItem()}>
              <dt className={styles.tooltipName()}>
                <Indicator kind={indicator} color={colorOf(item)} />
                {shownName}
              </dt>
              <dd className={styles.tooltipValue()}>{value}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

ChartTooltipContent.displayName = 'Chart.TooltipContent';

export function ChartTooltip({ indicator, hideLabel, content, ...props }: ChartTooltipProps) {
  const { config } = useChartContext('Chart.Tooltip');

  return (
    <Tooltip
      itemSorter={(item) => configOrder(config, item.name, item.dataKey)}
      {...props}
      content={content ?? <ChartTooltipContent indicator={indicator} hideLabel={hideLabel} />}
    />
  );
}

ChartTooltip.displayName = 'Chart.Tooltip';
