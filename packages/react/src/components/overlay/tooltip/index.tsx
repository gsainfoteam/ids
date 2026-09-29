import { type ReactNode } from 'react';

import { TooltipArrow, type TooltipArrowProps } from './arrow';
import { TooltipContent, type TooltipContentProps } from './content';
import { TooltipContext } from './context';
import { tooltipStyle } from './style';
import { TooltipTrigger, type TooltipTriggerProps } from './trigger';
import { useTooltip, type UseTooltipOptions } from './use-tooltip';

import type { AnchoredSide } from '../../../internal/overlay';

export { TooltipDelayGroup } from './delay-group';

export function Tooltip({ content, arrow = false, children, ...options }: Tooltip.Props) {
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

export namespace Tooltip {
  export type Side = AnchoredSide;

  export type Props = UseTooltipOptions & {
    content?: ReactNode;
    arrow?: boolean;
    children?: ReactNode;
  };

  export const Trigger = TooltipTrigger;
  export namespace Trigger {
    export type Props = TooltipTriggerProps;
  }

  export const Content = TooltipContent;
  export namespace Content {
    export type Props = TooltipContentProps;
  }

  export const Arrow = TooltipArrow;
  export namespace Arrow {
    export type Props = TooltipArrowProps;
  }

  export const Style = tooltipStyle;
}
