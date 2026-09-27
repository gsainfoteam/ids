import { createContext, use, type KeyboardEvent } from 'react';

export type ToggleGroupSelectionMode = 'single' | 'multiple';

export type ToggleGroupContextValue = {
  // Marks this group's items so that a group nested inside does not mix its items in.
  id: string;
  selectionMode: ToggleGroupSelectionMode;
  disabled: boolean;
  form: string | undefined;
  isPressed: (value: string) => boolean;
  toggle: (value: string) => void;
  // The value holding the tab stop; undefined until the items have been measured.
  tabStop: string | null | undefined;
  onItemFocus: (value: string) => void;
  onItemKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export function useToggleGroupContext() {
  return use(ToggleGroupContext);
}
