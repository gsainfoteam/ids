'use client';

import { TooltipContext } from './context';
import { useInternalTooltip } from './hooks/use-tooltip';
import { tooltipStyle } from './style';

import type { Tooltip } from '.';

export function TooltipRoot({ children, ...options }: Tooltip.Props) {
  const tooltip = useInternalTooltip(options);

  return <TooltipContext value={{ tooltip, styles: tooltipStyle() }}>{children}</TooltipContext>;
}
