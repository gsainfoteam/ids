'use client';

import { useState, type ReactNode } from 'react';

import { PopoverArrow, type PopoverArrowProps } from './arrow';
import { PopoverClose, type PopoverCloseProps } from './close';
import { PopoverContent, type PopoverContentProps } from './content';
import { PopoverContext } from './context';
import { PopoverDescription, type PopoverDescriptionProps } from './description';
import { popoverStyle } from './style';
import { PopoverTitle, type PopoverTitleProps } from './title';
import { PopoverTrigger, type PopoverTriggerProps } from './trigger';
import { usePopover, type PopoverAnchor, type PopoverTriggerType } from './use-popover';

import type { AnchoredAlign, AnchoredSide } from '../../../internal/overlay';

export function Popover({
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

export namespace Popover {
  export type Side = AnchoredSide;
  export type Align = AnchoredAlign;
  export type TriggerType = PopoverTriggerType;
  export type Anchor = PopoverAnchor;

  export type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpenChangeComplete?: (open: boolean) => void;
    modal?: boolean;
    triggerType?: TriggerType;
    openDelay?: number;
    closeDelay?: number;
    children?: ReactNode;
  };

  export const Trigger = PopoverTrigger;
  export namespace Trigger {
    export type Props = PopoverTriggerProps;
  }

  export const Content = PopoverContent;
  export namespace Content {
    export type Props = PopoverContentProps;
  }

  export const Arrow = PopoverArrow;
  export namespace Arrow {
    export type Props = PopoverArrowProps;
  }

  export const Title = PopoverTitle;
  export namespace Title {
    export type Props = PopoverTitleProps;
  }

  export const Description = PopoverDescription;
  export namespace Description {
    export type Props = PopoverDescriptionProps;
  }

  export const Close = PopoverClose;
  export namespace Close {
    export type Props = PopoverCloseProps;
  }

  export const Style = popoverStyle;
}
