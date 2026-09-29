'use client';

import { createContext, use, type KeyboardEvent } from 'react';

export type ToggleGroupSelectionMode = 'single' | 'multiple';

export type ToggleGroupContextValue = {
  id: string;
  selectionMode: ToggleGroupSelectionMode;
  disabled: boolean;
  form: string | undefined;
  isPressed: (value: string) => boolean;
  toggle: (value: string) => void;
  tabStop: string | null | undefined;
  onItemFocus: (value: string) => void;
  onItemKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export function useToggleGroupContext() {
  return use(ToggleGroupContext);
}
