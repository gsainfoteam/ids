'use client';

import { useLayoutEffect } from 'react';

import type { PopoverHoverDelays } from './use-popover';

export function useInternalPopoverTriggerDelays(
  setDelays: (delays: PopoverHoverDelays) => void,
  openDelay: number,
  closeDelay: number,
) {
  useLayoutEffect(() => {
    setDelays({ open: openDelay, close: closeDelay });
  }, [setDelays, openDelay, closeDelay]);
}
