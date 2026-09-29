'use client';

import { createContext, type ReactNode } from 'react';

import { FloatingDelayGroup } from '../../../internal/overlay';

export type TooltipDelays = { open: number; close: number };

export const TOOLTIP_DELAYS: TooltipDelays = { open: 600, close: 0 };

const STAYS_WARM_AFTER_CLOSING_MS = 300;

export const TooltipDelayGroupContext = createContext<TooltipDelays | null>(null);

export function TooltipDelayGroup({
  openDelay = TOOLTIP_DELAYS.open,
  closeDelay = TOOLTIP_DELAYS.close,
  children,
}: TooltipDelayGroup.Props) {
  const delays = { open: openDelay, close: closeDelay };

  return (
    <TooltipDelayGroupContext value={delays}>
      <FloatingDelayGroup delay={delays} timeoutMs={STAYS_WARM_AFTER_CLOSING_MS}>
        {children}
      </FloatingDelayGroup>
    </TooltipDelayGroupContext>
  );
}

export namespace TooltipDelayGroup {
  export type Props = {
    openDelay?: number;
    closeDelay?: number;
    children?: ReactNode;
  };
}
