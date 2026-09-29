'use client';

import { isValidElement, useState, type ReactElement, type ReactNode } from 'react';

import { DrawerContext } from './context';
import { DrawerOverlay, type DrawerOverlayProps } from './overlay';
import { drawerStyle } from './style';
import { useDrawer } from './use-drawer';
import { flattenFragments } from '../../../utils';

import type { Drawer } from '.';

const isOverlay = (node: ReactNode): node is ReactElement<DrawerOverlayProps> =>
  isValidElement(node) && node.type === DrawerOverlay;

export function DrawerRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  dismissible = true,
  role = 'dialog',
  hideClose = false,
  side = 'right',
  modal = true,
  scaleBackground = true,
  snapPoints,
  activeSnapPoint,
  defaultActiveSnapPoint,
  onActiveSnapPointChange,
  fadeFromIndex,
  children,
}: Drawer.Props) {
  const drawer = useDrawer({
    open,
    defaultOpen,
    onOpenChange,
    onOpenChangeComplete,
    dismissible,
    side,
    modal,
    scaleBackground,
    snapPoints,
    activeSnapPoint,
    defaultActiveSnapPoint,
    onActiveSnapPointChange,
    fadeFromIndex,
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
        hideClose,
        overlay: overlay?.props,
        titled,
        setTitled,
        described,
        setDescribed,
        styles: drawerStyle({ side, snapping: !!snapPoints && snapPoints.length > 0 }),
      }}
    >
      {parts.filter((node) => node !== overlay)}
    </DrawerContext>
  );
}
