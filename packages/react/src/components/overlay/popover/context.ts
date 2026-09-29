'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { popoverStyle } from './style';
import type { usePopover } from './use-popover';

type PopoverContextValue = {
  popover: ReturnType<typeof usePopover>;
  titled: boolean;
  setTitled: (titled: boolean) => void;
  described: boolean;
  setDescribed: (described: boolean) => void;
  styles: ReturnType<typeof popoverStyle>;
};

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(part: string) {
  const context = use(PopoverContext);
  invariant(context, `${part} must be rendered inside Popover.`);
  return context;
}
