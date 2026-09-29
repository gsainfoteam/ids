'use client';

import { useState } from 'react';

import { PopoverContext } from './context';
import { popoverStyle } from './style';
import { usePopover } from './use-popover';

import type { Popover } from '.';

export function PopoverRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  modal = false,
  triggerType = 'click',
  openDelay = 200,
  closeDelay = 100,
  children,
}: Popover.Props) {
  const popover = usePopover({
    open,
    defaultOpen,
    onOpenChange,
    onOpenChangeComplete,
    modal,
    triggerType,
    openDelay,
    closeDelay,
  });

  const [titled, setTitled] = useState(false);
  const [described, setDescribed] = useState(false);

  return (
    <PopoverContext
      value={{
        popover,
        titled,
        setTitled,
        described,
        setDescribed,
        styles: popoverStyle(),
      }}
    >
      {children}
    </PopoverContext>
  );
}
