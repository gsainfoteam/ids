import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ComposedChart,
  Funnel,
  FunnelChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { entryFor, seriesColor, type ChartConfig } from './config';
import { elementTypeOf } from '../../../utils';

type PaintProperty = 'fill' | 'stroke';

type SeriesProps = {
  dataKey?: unknown;
  nameKey?: unknown;
  name?: unknown;
  data?: unknown;
  children?: ReactNode;
} & Partial<Record<PaintProperty, unknown>>;

export type GraphProps = SeriesProps & { layout?: unknown };

export type ChartTableModel = {
  category: { key: string; label: ReactNode };
  series: { key: string; label: ReactNode }[];
  rows: { id: string; category: ReactNode; values: unknown[] }[];
};

export const RECHARTS_CHARTS: ReadonlySet<unknown> = new Set([
  AreaChart,
  BarChart,
  ComposedChart,
  FunnelChart,
  LineChart,
  PieChart,
  RadarChart,
  RadialBarChart,
  ScatterChart,
]);

export const RECHARTS_TOOLTIP = Tooltip;
export const RECHARTS_LEGEND = Legend;

const PAINTED_BY_KEY = new Map<unknown, readonly PaintProperty[]>([
  [Area, ['stroke', 'fill']],
  [Bar, ['fill']],
  [Line, ['stroke']],
  [Radar, ['stroke', 'fill']],
  [Scatter, ['fill']],
]);

const PAINTED_BY_ROW: ReadonlySet<unknown> = new Set([Pie, RadialBar, Funnel]);

const CATEGORY_AXES: ReadonlySet<unknown> = new Set([XAxis, YAxis, PolarAngleAxis]);

const DEFAULT_PIE_NAME_KEY = 'name';

export const elementsIn = (children: ReactNode) =>
  Children.toArray(children).filter((child): child is ReactElement<SeriesProps> =>
    isValidElement<SeriesProps>(child),
  );

const isSeries = (element: ReactElement) => {
  const type = elementTypeOf(element);
  return PAINTED_BY_KEY.has(type) || PAINTED_BY_ROW.has(type);
};

export function paintSeries(children: ReactNode, config: ChartConfig): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<SeriesProps>(child)) return child;
    const paints = PAINTED_BY_KEY.get(elementTypeOf(child));
    const { dataKey, name } = child.props;
    if (!paints || typeof dataKey !== 'string' || !config[dataKey]) return child;

    const label = config[dataKey].label;
    const unpainted = paints.filter((property) => child.props[property] === undefined);
    return cloneElement(child, {
      ...Object.fromEntries(unpainted.map((property) => [property, seriesColor(dataKey)])),
      ...(name === undefined && typeof label === 'string' ? { name: label } : {}),
    });
  });
}

function rowsOf(graph: GraphProps, series: ReactElement<SeriesProps>[]) {
  const ownData = series.find((element) => Array.isArray(element.props.data))?.props.data;
  const data = Array.isArray(graph.data) ? graph.data : ownData;
  return Array.isArray(data)
    ? data.filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    : [];
}

function seriesKeysOf(
  series: ReactElement<SeriesProps>[],
  rows: Record<string, unknown>[],
  config: ChartConfig,
) {
  const keyed = series.flatMap(({ props }) =>
    typeof props.dataKey === 'string' ? [props.dataKey] : [],
  );
  const keys = keyed.length > 0 ? keyed : Object.keys(config).filter((key) => key in rows[0]!);
  return [...new Set(keys)];
}

function categoryKeyOf(
  elements: ReactElement<SeriesProps>[],
  rows: Record<string, unknown>[],
  seriesKeys: string[],
) {
  const axis = elements.find(
    (element) =>
      CATEGORY_AXES.has(elementTypeOf(element)) &&
      typeof element.props.dataKey === 'string' &&
      !seriesKeys.includes(element.props.dataKey),
  );
  if (axis) return { key: axis.props.dataKey as string, name: axis.props.name };

  const pie = elements.find((element) => elementTypeOf(element) === Pie);
  if (pie) {
    const nameKey = pie.props.nameKey;
    return { key: typeof nameKey === 'string' ? nameKey : DEFAULT_PIE_NAME_KEY, name: undefined };
  }

  const textKey = Object.keys(rows[0]!).find(
    (key) => !seriesKeys.includes(key) && typeof rows[0]![key] === 'string',
  );
  return textKey ? { key: textKey, name: undefined } : undefined;
}

export function tableOf(graph: GraphProps, config: ChartConfig): ChartTableModel | undefined {
  const elements = elementsIn(graph.children);
  const series = elements.filter(isSeries);
  const rows = rowsOf(graph, series);
  if (rows.length === 0) return undefined;

  const seriesKeys = seriesKeysOf(series, rows, config);
  const category = categoryKeyOf(elements, rows, seriesKeys);
  if (!category || seriesKeys.length === 0) return undefined;

  const seriesName = (key: string) =>
    series.find(({ props }) => props.dataKey === key)?.props.name as ReactNode;

  return {
    category: { key: category.key, label: (category.name as ReactNode) ?? category.key },
    series: seriesKeys.map((key) => ({
      key,
      label: entryFor(config, key)?.entry.label ?? seriesName(key) ?? key,
    })),
    rows: rows.map((row, index) => {
      const value = row[category.key];
      return {
        id: `${index}:${String(value)}`,
        category: entryFor(config, value)?.entry.label ?? String(value ?? ''),
        values: seriesKeys.map((key) => row[key]),
      };
    }),
  };
}
