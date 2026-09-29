import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { tooltipStyle } from './style';
import type { useTooltip } from './use-tooltip';

type TooltipContextValue = {
  tooltip: ReturnType<typeof useTooltip>;
  styles: ReturnType<typeof tooltipStyle>;
};

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltipContext(part: string) {
  const context = use(TooltipContext);
  invariant(context, `${part} must be rendered inside Tooltip.`);
  return context;
}
