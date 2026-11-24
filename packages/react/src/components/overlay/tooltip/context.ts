'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { useInternalTooltip } from './hooks/use-tooltip';
import type { tooltipStyle } from './style';

type TooltipContextValue = {
  tooltip: ReturnType<typeof useInternalTooltip>;
  styles: ReturnType<typeof tooltipStyle>;
};

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useInternalTooltipContext(part: string) {
  const context = use(TooltipContext);
  invariant(context, `${part} must be rendered inside Tooltip.`);
  return context;
}
