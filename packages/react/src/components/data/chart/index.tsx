import type { ComponentProps, ReactNode } from 'react';

import {
  type ChartColor,
  type ChartConfig,
  type ChartConfigEntry,
  type ChartIndicator,
} from './config';
import { ChartDescription, type ChartDescriptionProps } from './description';
import {
  ChartLegend,
  ChartLegendContent,
  type ChartLegendContentProps,
  type ChartLegendFormatter,
  type ChartLegendProps,
} from './legend';
import { ChartRoot } from './root';
import { chartStyle } from './style';
import { ChartTable, type ChartTableProps } from './table';
import { ChartTitle, type ChartTitleProps } from './title';
import {
  ChartTooltip,
  ChartTooltipContent,
  type ChartTooltipContentProps,
  type ChartTooltipProps,
} from './tooltip';

export function Chart(props: Chart.Props) {
  return <ChartRoot {...props} />;
}

export namespace Chart {
  export type Config = ChartConfig;
  export type ConfigEntry = ChartConfigEntry;
  export type Color = ChartColor;
  export type Indicator = ChartIndicator;

  export type Props = Omit<ComponentProps<'figure'>, 'children'> & {
    config: ChartConfig;
    ratio?: number;
    tooltip?: boolean;
    legend?: boolean;
    locale?: string;
    children?: ReactNode;
  };

  export type TitleProps = ChartTitleProps;
  export type DescriptionProps = ChartDescriptionProps;
  export type TooltipProps = ChartTooltipProps;
  export type TooltipContentProps = ChartTooltipContentProps;
  export type LegendProps = ChartLegendProps;
  export type LegendContentProps = ChartLegendContentProps;
  export type LegendFormatter = ChartLegendFormatter;
  export type TableProps = ChartTableProps;

  export const Title = ChartTitle;
  export namespace Title {
    export type Props = ChartTitleProps;
  }

  export const Description = ChartDescription;
  export namespace Description {
    export type Props = ChartDescriptionProps;
  }

  export const Tooltip = ChartTooltip;
  export namespace Tooltip {
    export type Props = ChartTooltipProps;
  }

  export const TooltipContent = ChartTooltipContent;
  export namespace TooltipContent {
    export type Props = ChartTooltipContentProps;
  }

  export const Legend = ChartLegend;
  export namespace Legend {
    export type Props = ChartLegendProps;
  }

  export const LegendContent = ChartLegendContent;
  export namespace LegendContent {
    export type Props = ChartLegendContentProps;
  }

  export const Table = ChartTable;
  export namespace Table {
    export type Props = ChartTableProps;
  }

  export const Style = chartStyle;
}

export type ChartProps = Chart.Props;
export type { ChartColor, ChartConfig, ChartConfigEntry, ChartIndicator } from './config';
