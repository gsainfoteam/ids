import type { CSSProperties, ReactNode } from 'react';

import type { IdsBrandFamily, IdsStatusFamily } from '../../utility/ids-provider/theme';

export type ChartColor = IdsBrandFamily | IdsStatusFamily | 'neutral' | (string & {});

export type ChartConfigEntry = { label: ReactNode; color?: ChartColor };

export type ChartConfig = Record<string, ChartConfigEntry>;

export type ChartIndicator = 'dot' | 'line' | 'dashed';

export const DEFAULT_SERIES: readonly IdsBrandFamily[] = ['primary', 'secondary', 'tertiary'];

const FAMILY_COLORS: { [color: string]: string } = {
  primary: 'var(--ids-color-bg-primary)',
  secondary: 'var(--ids-color-bg-secondary)',
  tertiary: 'var(--ids-color-bg-tertiary)',
  success: 'var(--ids-color-bg-success)',
  warning: 'var(--ids-color-bg-warning)',
  danger: 'var(--ids-color-bg-danger)',
  info: 'var(--ids-color-bg-info)',
  neutral: 'var(--ids-color-text-neutral)',
};

export const seriesVariable = (key: string) => `--chart-${key}`;

export const seriesColor = (key: string) => `var(${seriesVariable(key)})`;

const colorOf = (color: ChartColor) => FAMILY_COLORS[color] ?? color;

export const uncoloredKeys = (config: ChartConfig) =>
  Object.keys(config).filter((key) => config[key]!.color === undefined);

const defaultColorAt = (index: number) => FAMILY_COLORS[DEFAULT_SERIES[index] ?? 'neutral']!;

export function seriesVariables(config: ChartConfig): CSSProperties {
  const uncolored = uncoloredKeys(config);

  return Object.fromEntries(
    Object.entries(config).map(([key, entry]) => [
      seriesVariable(key),
      entry.color === undefined ? defaultColorAt(uncolored.indexOf(key)) : colorOf(entry.color),
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
