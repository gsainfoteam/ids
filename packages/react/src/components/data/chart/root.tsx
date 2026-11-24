'use client';

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ChartContext } from './context';
import { useInternalChartSize } from './hooks/use-chart-size';
import { useInternalKeysOverARestingPointer } from './hooks/use-keys-over-a-resting-pointer';
import { DEFAULT_SERIES, seriesColor, seriesVariables, uncoloredKeys } from './lib/config';
import { fadedSeriesOf, paintSeries, RECHARTS_CHARTS, tableOf, type GraphProps } from './lib/graph';
import { ChartDescription } from './parts/description';
import { ChartTable } from './parts/table';
import { ChartTitle } from './parts/title';
import { chartStyle } from './style';
import {
  hasAccessibleName,
  useInternalUnnamedWarning,
} from '../../../internal/lib/accessible-name';
import { useInternalProviderLocale } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { Chart } from '.';

type GraphElement = ReactElement<
  GraphProps & {
    role?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
  }
>;

const CAPTION_PARTS: ReadonlySet<unknown> = new Set([ChartTitle, ChartDescription]);
const PARTS: ReadonlySet<unknown> = new Set([...CAPTION_PARTS, ChartTable]);

const isElementOf =
  (type: unknown) =>
  (node: ReactNode): node is ReactElement<{ id?: string }> =>
    isValidElement(node) && elementTypeOf(node) === type;

const WRAPPED_CHART_WARNING =
  '[IDS] Chart: its chart child is not a Recharts chart, so Chart cannot paint its series or add the screen reader table. Place the Recharts chart as a direct child, or place Chart.Table yourself.';

const tooManySeriesWarning = (count: number) =>
  `[IDS] Chart: ${count} series have no color, but the default colors are only ${DEFAULT_SERIES.join(', ')}, so the rest draw in neutral. Give the 4th and later series a color in the config.`;

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

function paintedChildren(
  graph: GraphElement,
  config: Chart.Config,
  fadeIdOf: (key: string) => string,
) {
  const own = graph.props.children;
  return [
    fadeDefinitions(fadedSeriesOf(own, config), fadeIdOf, graph.props.layout === 'vertical'),
    paintSeries(own, config, fadeIdOf),
  ];
}

export function ChartRoot({ config, className, style, children, ...props }: Chart.Props) {
  const providerLocale = useInternalProviderLocale();
  const id = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const size = useInternalChartSize(frameRef);
  const keysOverARestingPointer = useInternalKeysOverARestingPointer(frameRef);
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
  const graphName = {
    'aria-label': graph?.props['aria-label'],
    'aria-labelledby': graph?.props['aria-labelledby'] ?? titleId,
  };

  const wrapsAnUnknownChart = graph !== undefined && !recognised && !hasOwnTable;
  const uncoloredSeries = uncoloredKeys(config).length;
  useInternalUnnamedWarning('Chart', graph !== undefined && !hasAccessibleName(graphName));

  useEffect(() => {
    if (isDevelopment && wrapsAnUnknownChart) console.warn(WRAPPED_CHART_WARNING);
  }, [wrapsAnUnknownChart]);

  useEffect(() => {
    if (isDevelopment && uncoloredSeries > DEFAULT_SERIES.length)
      console.warn(tooManySeriesWarning(uncoloredSeries));
  }, [uncoloredSeries]);

  const drawn =
    graph && size
      ? cloneElement(
          graph,
          {
            width: size.width,
            height: size.height,
            role: graph.props.role ?? 'img',
            ...graphName,
            'aria-describedby': graph.props['aria-describedby'] ?? descriptionId,
          } as Partial<GraphElement['props']>,
          ...(recognised ? [paintedChildren(graph, config, fadeIdOf)] : []),
        )
      : null;

  return (
    <ChartContext
      value={{
        config,
        styles,
        locale: providerLocale,
        titleId,
        descriptionId,
        table,
        frameRef,
      }}
    >
      <figure
        {...props}
        data-chart=""
        className={styles.root({ className })}
        style={{ ...seriesVariables(config), ...style }}
      >
        {caption.length > 0 && <figcaption className={styles.caption()}>{caption}</figcaption>}
        <div
          ref={frameRef}
          data-chart-frame=""
          className={styles.frame()}
          {...keysOverARestingPointer}
        >
          {drawn}
        </div>
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
