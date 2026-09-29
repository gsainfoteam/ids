'use client';

import { TooltipArrow } from './arrow';
import { TooltipContent } from './content';
import { TooltipContext } from './context';
import { tooltipStyle } from './style';
import { TooltipTrigger } from './trigger';
import { useTooltip } from './use-tooltip';

import type { Tooltip } from '.';

export function TooltipRoot({ content, arrow = false, children, ...options }: Tooltip.Props) {
  const tooltip = useTooltip(options);
  const shorthand = content !== undefined;

  return (
    <TooltipContext value={{ tooltip, styles: tooltipStyle() }}>
      {shorthand ? (
        <>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent>
            {content}
            {arrow && <TooltipArrow />}
          </TooltipContent>
        </>
      ) : (
        children
      )}
    </TooltipContext>
  );
}
