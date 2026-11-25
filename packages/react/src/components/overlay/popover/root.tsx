'use client';

import { PopoverContext } from './context';
import { useInternalPopover } from './hooks/use-popover';
import { useInternalPopoverLabelling } from './hooks/use-popover-labelling';
import { popoverStyle } from './style';

import type { Popover } from '.';

export function PopoverRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  modal = false,
  triggerType = 'click',
  children,
}: Popover.Props) {
  const popover = useInternalPopover({
    open,
    defaultOpen,
    onOpenChange,
    onOpenChangeComplete,
    modal,
    triggerType,
  });

  const labelling = useInternalPopoverLabelling();

  return (
    <PopoverContext
      value={{
        popover,
        ...labelling,
        styles: popoverStyle(),
      }}
    >
      {children}
    </PopoverContext>
  );
}
