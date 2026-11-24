'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { useInternalPopover } from './hooks/use-popover';
import type { popoverStyle } from './style';

type PopoverContextValue = {
  popover: ReturnType<typeof useInternalPopover>;
  titled: boolean;
  setTitled: (titled: boolean) => void;
  described: boolean;
  setDescribed: (described: boolean) => void;
  styles: ReturnType<typeof popoverStyle>;
};

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function useInternalPopoverContext(part: string) {
  const context = use(PopoverContext);
  invariant(context, `${part} must be rendered inside Popover.`);
  return context;
}
