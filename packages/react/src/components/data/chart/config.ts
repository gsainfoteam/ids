import type { CSSProperties, ReactNode } from 'react';

export type ChartSeriesToken = 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5';

export type ChartColor =
  | ChartSeriesToken
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'on-muted';

export type ChartConfigEntry = { label: ReactNode; color?: ChartColor };

export type ChartConfig = Record<string, ChartConfigEntry>;

export type ChartIndicator = 'dot' | 'line' | 'dashed';

const SERIES_TOKENS: readonly ChartSeriesToken[] = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
];

export const seriesVariable = (key: string) => `--chart-${key}`;

export const seriesColor = (key: string) => `var(${seriesVariable(key)})`;

export function seriesVariables(config: ChartConfig): CSSProperties {
  return Object.fromEntries(
    Object.entries(config).map(([key, entry], index) => [
      seriesVariable(key),
      `var(--ids-color-${entry.color ?? SERIES_TOKENS[index % SERIES_TOKENS.length]})`,
    ]),
  );
}

export function entryFor(config: ChartConfig, ...keys: unknown[]) {
  for (const key of keys) {
    if (key === undefined || key === null) continue;
    const entry = config[String(key)];
    if (entry) return { key: String(key), entry };
  }
  return undefined;
}

export function configOrder(config: ChartConfig, ...keys: unknown[]) {
  const order = Object.keys(config);
  const found = entryFor(config, ...keys);
  return found ? order.indexOf(found.key) : order.length;
}
