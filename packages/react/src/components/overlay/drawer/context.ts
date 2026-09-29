'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Drawer } from '.';
import type { drawerStyle } from './style';
import type { useDrawer } from './use-drawer';

type DrawerContextValue = {
  drawer: ReturnType<typeof useDrawer>;
  role: Drawer.Role;
  side: Drawer.Side;
  modal: boolean;
  dismissible: boolean;
  hideClose: boolean;
  overlay: Drawer.Overlay.Props | undefined;
  titled: boolean;
  setTitled: (titled: boolean) => void;
  described: boolean;
  setDescribed: (described: boolean) => void;
  styles: ReturnType<typeof drawerStyle>;
};

export const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawerContext(part: string) {
  const context = use(DrawerContext);
  invariant(context, `${part} must be rendered inside Drawer.`);
  return context;
}
