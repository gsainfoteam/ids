'use client';

import { createContext } from 'react';

export type OverlayItemBinding = {
  open: boolean;
  close: (value?: unknown) => void;
  exited: () => void;
  bind: () => () => void;
};

export const OverlayItemContext = createContext<OverlayItemBinding | null>(null);

export const PortalRootContext = createContext<HTMLElement | null>(null);
