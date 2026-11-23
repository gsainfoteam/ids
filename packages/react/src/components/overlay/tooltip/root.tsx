'use client';

import { TooltipContext } from './context';
import { tooltipStyle } from './style';
import { useTooltip } from './use-tooltip';

import type { Tooltip } from '.';

export function TooltipRoot({ children, ...options }: Tooltip.Props) {
  const tooltip = useTooltip(options);

  return <TooltipContext value={{ tooltip, styles: tooltipStyle() }}>{children}</TooltipContext>;
}
