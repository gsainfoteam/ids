import { type ReactNode } from 'react';

import { type UseTooltipOptions } from './hooks/use-tooltip';
import { TooltipArrow, type TooltipArrowProps } from './parts/arrow';
import { TooltipContent, type TooltipContentProps } from './parts/content';
import { TooltipTrigger, type TooltipTriggerProps } from './parts/trigger';
import { TooltipRoot } from './root';
import { tooltipStyle } from './style';

import type { AnchoredAlign, AnchoredSide } from '../../../internal/overlay';

export function Tooltip(props: Tooltip.Props) {
  return <TooltipRoot {...props} />;
}

export namespace Tooltip {
  export type Side = AnchoredSide;
  export type Align = AnchoredAlign;

  export type Props = UseTooltipOptions & {
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
export { TooltipDelayGroup } from './parts/delay-group';
