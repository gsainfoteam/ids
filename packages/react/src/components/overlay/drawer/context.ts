'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Drawer } from '.';
import type { useInternalDrawerRoot } from './hooks/use-drawer-root';
import type { drawerStyle } from './style';

type DrawerContextValue = {
  drawer: ReturnType<typeof useInternalDrawerRoot>;
  role: Drawer.Role;
  side: Drawer.Side;
  modal: boolean;
  dismissible: boolean;
  overlay: Drawer.Overlay.Props | undefined;
  titled: boolean;
  setTitled: (titled: boolean) => void;
  described: boolean;
  setDescribed: (described: boolean) => void;
  styles: ReturnType<typeof drawerStyle>;
};

export const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useInternalDrawerContext(part: string) {
  const context = use(DrawerContext);
  invariant(context, `${part} must be rendered inside Drawer.`);
  return context;
}
