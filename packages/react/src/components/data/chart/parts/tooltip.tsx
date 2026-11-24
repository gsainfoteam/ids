'use client';

import { isValidElement, useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';

import {
  Tooltip,
  type TooltipContentProps,
  type TooltipPayloadEntry,
  type TooltipProps,
} from 'recharts';

import { useInternalChartContext } from '../context';
import { Indicator } from './indicator';
import { showInTopLayer, useInternalAnchored } from '../../../../internal/overlay';
import { Card } from '../../card';
import { useInternalFormatValue } from '../hooks/use-format-value';
import { configOrder, entryFor, type ChartIndicator } from '../lib/config';

export type ChartTooltipProps = TooltipProps & {
  indicator?: ChartIndicator;
};

export type ChartTooltipContentProps = Partial<TooltipContentProps> & {
  indicator?: ChartIndicator;
};

type Row = { fill?: unknown };

const GAP_FROM_THE_POINT = 12;

const pointIn = (frameRef: RefObject<HTMLDivElement | null>, x: number, y: number) => ({
  getBoundingClientRect: () => {
    const frame = frameRef.current?.getBoundingClientRect();
    return DOMRect.fromRect({ x: (frame?.left ?? 0) + x, y: (frame?.top ?? 0) + y });
  },
});

const isDrawable = (node: ReactNode) => node !== undefined && node !== null && node !== '';

const colorOf = (item: TooltipPayloadEntry) =>
  item.color ?? (item.payload as Row | undefined)?.fill?.toString() ?? item.fill?.toString();

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = 'dot',
  formatter,
  labelFormatter,
  coordinate,
}: ChartTooltipContentProps) {
  const { config, styles, locale, frameRef } = useInternalChartContext('Chart.Tooltip');
  const format = useInternalFormatValue(locale);
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const open = Boolean(active && payload?.length);

  const anchored = useInternalAnchored({
    open,
    reference: frameRef,
    floating: box,
    side: 'right',
    align: 'start',
    sideOffset: GAP_FROM_THE_POINT,
    glide: true,
  });
  const { setPositionReference } = anchored.refs;
  const x = coordinate?.x;
  const y = coordinate?.y;

  useLayoutEffect(() => {
    if (x !== undefined && y !== undefined) setPositionReference(pointIn(frameRef, x, y));
  }, [frameRef, x, y, setPositionReference]);

  useLayoutEffect(() => {
    if (box?.isConnected) showInTopLayer(box);
  }, [box]);

  if (!open || !payload) return null;

  const labelText: ReactNode = entryFor(config, label)?.entry.label ?? label;
  const heading =
    isDrawable(labelText) && labelFormatter ? labelFormatter(labelText, payload) : labelText;

  return (
    <Card
      ref={setBox}
      popover="manual"
      size="tiny"
      data-chart-tooltip=""
      data-side={anchored.side}
      data-gliding={anchored.gliding ? '' : undefined}
      className={styles.tooltip()}
      style={anchored.floatingStyles}
    >
      {isDrawable(labelText) && isDrawable(heading) && (
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
    </Card>
  );
}

ChartTooltipContent.displayName = 'Chart.TooltipContent';

export function ChartTooltip({ indicator, content, ...props }: ChartTooltipProps) {
  const { config } = useInternalChartContext('Chart.Tooltip');

  return (
    <Tooltip
      itemSorter={(item) => configOrder(config, item.name, item.dataKey)}
      {...props}
      content={content ?? <ChartTooltipContent indicator={indicator} />}
    />
  );
}

ChartTooltip.displayName = 'Chart.Tooltip';
