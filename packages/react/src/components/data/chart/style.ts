import { tv } from '../../../utils';

import type { ChartIndicator } from './config';

export const chartStyle = tv({
  slots: {
    root: 'm-0 flex min-w-0 flex-col gap-4 text-(--ids-color-on-surface)',
    caption: 'flex flex-col gap-1',
    title: 'text-subtitle-s2-semibold [overflow-wrap:anywhere]',
    description: 'text-body-b3-regular text-(--ids-color-on-muted)',
    frame: [
      'text-caption-c1-regular',
      '[&_.recharts-surface]:overflow-visible [&_.recharts-surface]:rounded-standard [&_.recharts-surface]:outline-none',
      '[&_.recharts-surface:focus-visible]:ring-[3px] [&_.recharts-surface:focus-visible]:ring-(--ids-color-primary)/40',
      '[&_.recharts-text]:fill-(--ids-color-on-muted)',
      '[&_.recharts-cartesian-axis-line]:stroke-(--ids-color-border) [&_.recharts-cartesian-axis-tick-line]:stroke-(--ids-color-border)',
      '[&_.recharts-cartesian-grid_line]:stroke-(--ids-color-border) [&_.recharts-polar-grid_*]:stroke-(--ids-color-border)',
      '[&_.recharts-reference-line_line]:stroke-(--ids-color-border)',
      '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--ids-color-muted)',
      '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-(--ids-color-border)',
      '[&_.recharts-dot]:fill-(--ids-color-surface) [&_.recharts-active-dot_.recharts-dot]:stroke-(--ids-color-surface)',
      '[&_.recharts-sector]:stroke-(--ids-color-surface)',
    ],
    srTable: 'sr-only',
    srTableInner: 'w-max max-w-none',
    tooltip: [
      'grid min-w-32 gap-1.5 concentric-p-2 px-2.5',
      'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface) shadow-md',
      'text-caption-c1-regular',
    ],
    tooltipLabel: 'text-caption-c1-medium',
    tooltipList: 'm-0 grid gap-1',
    tooltipItem: 'flex items-center gap-2',
    tooltipName: 'flex flex-1 items-center gap-1.5 text-(--ids-color-on-muted)',
    tooltipValue: 'm-0 font-mono text-caption-c1-medium tabular-nums',
    legend: 'm-0 flex list-none flex-wrap items-center justify-center gap-x-4 gap-y-1 p-0 pt-3',
    legendItem: 'flex items-center gap-1.5 text-caption-c1-regular',
    indicator: 'shrink-0 bg-(--chart-indicator)',
  },
  variants: {
    indicator: {
      dot: { indicator: 'size-2.5 rounded-indicator' },
      line: { indicator: 'h-2.5 w-1 rounded-full' },
      dashed: {
        indicator: 'h-0 w-3 border-t-2 border-dashed border-(--chart-indicator) bg-transparent',
      },
    } satisfies Record<ChartIndicator, object>,
  },
  defaultVariants: { indicator: 'dot' },
});
