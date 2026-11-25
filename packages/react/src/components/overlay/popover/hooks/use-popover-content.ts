'use client';

import { useEffect, useLayoutEffect } from 'react';

import type { PopoverPlacement, useInternalPopover } from './use-popover';

type Popover = ReturnType<typeof useInternalPopover>;

export function useInternalPopoverContent(
  { setPlacement, mountContent }: Pick<Popover, 'setPlacement' | 'mountContent'>,
  { side, align, sideOffset, alignOffset, anchor, initialFocus }: PopoverPlacement,
) {
  const anchored = anchor !== undefined;

  useLayoutEffect(() => {
    setPlacement({ side, align, sideOffset, alignOffset, anchor, initialFocus });
  }, [setPlacement, side, align, sideOffset, alignOffset, anchor, initialFocus]);

  useEffect(() => mountContent(anchored), [mountContent, anchored]);
}
