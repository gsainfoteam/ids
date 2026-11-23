'use client';

import { isValidElement, useState, type ReactElement, type ReactNode } from 'react';

import { DrawerContext } from './context';
import { DrawerOverlay, type DrawerOverlayProps } from './overlay';
import { drawerStyle } from './style';
import { useDrawerRoot } from './use-drawer-root';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { Drawer } from '.';

const isOverlay = (node: ReactNode): node is ReactElement<DrawerOverlayProps> =>
  isValidElement(node) && elementTypeOf(node) === DrawerOverlay;

export function DrawerRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  dismissible = true,
  role = 'dialog',
  side = 'right',
  modal = true,
  drawer: controller,
  children,
}: Drawer.Props) {
  const snap = controller?.snap ?? null;

  const drawer = useDrawerRoot({
    open,
    defaultOpen,
    onOpenChange,
    onOpenChangeComplete,
    dismissible,
    side,
    modal,
    snap,
  });

  const [titled, setTitled] = useState(false);
  const [described, setDescribed] = useState(false);

  const parts = flattenFragments(children);
  const overlay = parts.find(isOverlay);

  return (
    <DrawerContext
      value={{
        drawer,
        role,
        side,
        modal,
        dismissible,
        overlay: overlay?.props,
        titled,
        setTitled,
        described,
        setDescribed,
        styles: drawerStyle({ side, snapping: snap !== null }),
      }}
    >
      {parts.filter((node) => node !== overlay)}
    </DrawerContext>
  );
}
