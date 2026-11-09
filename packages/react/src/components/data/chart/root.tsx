'use client';

import {
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';

import { seriesColor, seriesVariables } from './config';
import { ChartContext } from './context';
import { ChartDescription } from './description';
import {
  fadedSeriesOf,
  paintSeries,
  RECHARTS_CHARTS,
  RECHARTS_LEGEND,
  RECHARTS_TOOLTIP,
  tableOf,
  type GraphProps,
} from './graph';
import { ChartLegend } from './legend';
import { chartStyle } from './style';
import { ChartTable } from './table';
import { ChartTitle } from './title';
import { ChartTooltip } from './tooltip';
import { useChartSize } from './use-chart-size';
import { DEFAULT_LOCALE } from '../../../internal/messages';
import { useProviderLocale, useTranslate } from '../../../internal/translate';
import { containsElementOfType, elementTypeOf, flattenFragments } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { AspectRatio } from '../../layout/aspect-ratio';

import type { Chart } from '.';

type GraphElement = ReactElement<
  GraphProps & {
    role?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
  }
>;

const TOOLTIPS: ReadonlySet<unknown> = new Set([ChartTooltip, RECHARTS_TOOLTIP]);
const LEGENDS: ReadonlySet<unknown> = new Set([ChartLegend, RECHARTS_LEGEND]);
const CAPTION_PARTS: ReadonlySet<unknown> = new Set([ChartTitle, ChartDescription]);
const PARTS: ReadonlySet<unknown> = new Set([...CAPTION_PARTS, ChartTable]);

const isElementOf =
  (type: unknown) =>
  (node: ReactNode): node is ReactElement<{ id?: string }> =>
    isValidElement(node) && elementTypeOf(node) === type;

const WRAPPED_CHART_WARNING =
  '[IDS] Chart: its chart child is not a Recharts chart, so Chart cannot add the default Tooltip, Legend and screen reader table. Place the Recharts chart as a direct child, or place Chart.Tooltip, Chart.Legend and Chart.Table yourself.';

const FADE_START_OPACITY = 0.4;
const FADE_END_OPACITY = 0;

const svgSafeId = (id: string) => id.replace(/[^\w-]/g, '');

function fadeDefinitions(keys: string[], fadeIdOf: (key: string) => string, sideways: boolean) {
  if (keys.length === 0) return null;
  return (
    <defs key="ids-chart-fades">
      {keys.map((key) => (
        <linearGradient
          key={key}
          id={fadeIdOf(key)}
          x1="0"
          y1="0"
          x2={sideways ? '1' : '0'}
          y2={sideways ? '0' : '1'}
        >
          <stop
            offset="0%"
            style={{ stopColor: seriesColor(key), stopOpacity: FADE_START_OPACITY }}
          />
          <stop
            offset="100%"
            style={{ stopColor: seriesColor(key), stopOpacity: FADE_END_OPACITY }}
          />
        </linearGradient>
      ))}
    </defs>
  );
}

function withDefaults(
  graph: GraphElement,
  config: Chart.Config,
  fadeIdOf: (key: string) => string,
  { tooltip, legend }: { tooltip: boolean; legend: boolean },
) {
  const own = graph.props.children;
  return [
    fadeDefinitions(fadedSeriesOf(own, config), fadeIdOf, graph.props.layout === 'vertical'),
    paintSeries(own, config, fadeIdOf),
    tooltip && !containsElementOfType(own, TOOLTIPS)
      ? createElement(ChartTooltip, { key: 'ids-chart-tooltip' })
      : null,
    legend && !containsElementOfType(own, LEGENDS)
      ? createElement(ChartLegend, { key: 'ids-chart-legend' })
      : null,
  ];
}

export function ChartRoot({
  config,
  ratio = 16 / 9,
  tooltip = true,
  legend = true,
  locale,
  className,
  style,
  children,
  ...props
}: Chart.Props) {
  const t = useTranslate();
  const providerLocale = useProviderLocale();
  const id = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const size = useChartSize(frameRef);
  const styles = chartStyle();

  const elements = flattenFragments(children);
  const caption = elements.filter(
    (node) => isValidElement(node) && CAPTION_PARTS.has(elementTypeOf(node)),
  );
  const graph = elements.find(
    (node): node is GraphElement => isValidElement(node) && !PARTS.has(elementTypeOf(node)),
  );
  const rest = elements.filter((node) => node !== graph && !caption.includes(node));
  const title = elements.find(isElementOf(ChartTitle));
  const description = elements.find(isElementOf(ChartDescription));
  const hasOwnTable = elements.some(isElementOf(ChartTable));
  const recognised = graph !== undefined && RECHARTS_CHARTS.has(elementTypeOf(graph));

  const fadeIdOf = (key: string) => `${svgSafeId(id)}-fade-${key}`;
  const titleId = title ? (title.props.id ?? `${id}title`) : undefined;
  const descriptionId = description ? (description.props.id ?? `${id}description`) : undefined;
  const table = recognised ? tableOf(graph.props, config) : undefined;

  useEffect(() => {
    if (isDevelopment && graph && !recognised && !hasOwnTable) console.warn(WRAPPED_CHART_WARNING);
  }, [graph, recognised, hasOwnTable]);

  const drawn =
    graph && size
      ? cloneElement(
          graph,
          {
            width: size.width,
            height: size.height,
            role: graph.props.role ?? 'img',
            'aria-labelledby': graph.props['aria-labelledby'] ?? titleId,
            'aria-label': titleId
              ? graph.props['aria-label']
              : (graph.props['aria-label'] ?? t('chart.label')),
            'aria-describedby': graph.props['aria-describedby'] ?? descriptionId,
          } as Partial<GraphElement['props']>,
          ...(recognised ? [withDefaults(graph, config, fadeIdOf, { tooltip, legend })] : []),
        )
      : null;

  return (
    <ChartContext
      value={{
        config,
        styles,
        locale: locale ?? providerLocale ?? DEFAULT_LOCALE,
        titleId,
        descriptionId,
        table,
      }}
    >
      <figure
        {...props}
        data-chart=""
        className={styles.root({ className })}
        style={{ ...seriesVariables(config), ...style }}
      >
        {caption.length > 0 && <figcaption className={styles.caption()}>{caption}</figcaption>}
        <AspectRatio ref={frameRef} ratio={ratio} data-chart-frame="" className={styles.frame()}>
          {drawn}
        </AspectRatio>
        {rest}
        {!hasOwnTable && table && (
          <div className={styles.srTable()}>
            <ChartTable className={styles.srTableInner()} />
          </div>
        )}
      </figure>
    </ChartContext>
  );
}
