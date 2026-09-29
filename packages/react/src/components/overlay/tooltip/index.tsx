import { type ReactNode } from 'react';

import { TooltipArrow, type TooltipArrowProps } from './arrow';
import { TooltipContent, type TooltipContentProps } from './content';
import { TooltipRoot } from './root';
import { tooltipStyle } from './style';
import { TooltipTrigger, type TooltipTriggerProps } from './trigger';
import { type UseTooltipOptions } from './use-tooltip';

import type { AnchoredSide } from '../../../internal/overlay';

export function Tooltip(props: Tooltip.Props) {
  return <TooltipRoot {...props} />;
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
export { TooltipDelayGroup } from './delay-group';
