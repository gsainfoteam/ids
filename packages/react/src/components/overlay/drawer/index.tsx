import { isValidElement, useState, type ReactElement, type ReactNode } from 'react';

import { DrawerClose, type DrawerCloseProps } from './close';
import { DrawerContent, type DrawerContentProps } from './content';
import { DrawerContext } from './context';
import { DrawerDescription, type DrawerDescriptionProps } from './description';
import { DrawerFooter, type DrawerFooterProps } from './footer';
import { DrawerHandle, type DrawerHandleProps } from './handle';
import { DrawerHeader, type DrawerHeaderProps } from './header';
import { DrawerOverlay, type DrawerOverlayProps } from './overlay';
import { drawerStyle } from './style';
import { DrawerTitle, type DrawerTitleProps } from './title';
import { DrawerTrigger, type DrawerTriggerProps } from './trigger';
import { useDrawer } from './use-drawer';
import { flattenFragments } from '../../../utils';

import type { DrawerSide, SnapPoint as DrawerSnapPoint } from './drawer-gesture';

const isOverlay = (node: ReactNode): node is ReactElement<DrawerOverlayProps> =>
  isValidElement(node) && node.type === DrawerOverlay;

export function Drawer({
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

export namespace Drawer {
  export type Role = 'dialog' | 'alertdialog';
  export type Side = DrawerSide;
  export type SnapPoint = DrawerSnapPoint;

  export type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpenChangeComplete?: (open: boolean) => void;
    dismissible?: boolean;
    role?: Role;
    hideClose?: boolean;
    side?: Side;
    modal?: boolean;
    scaleBackground?: boolean;
    snapPoints?: readonly SnapPoint[];
    activeSnapPoint?: SnapPoint;
    defaultActiveSnapPoint?: SnapPoint;
    onActiveSnapPointChange?: (snapPoint: SnapPoint) => void;
    fadeFromIndex?: number;
    children?: ReactNode;
  };

  export const Trigger = DrawerTrigger;
  export namespace Trigger {
    export type Props = DrawerTriggerProps;
  }

  export const Overlay = DrawerOverlay;
  export namespace Overlay {
    export type Props = DrawerOverlayProps;
  }

  export const Content = DrawerContent;
  export namespace Content {
    export type Props = DrawerContentProps;
  }

  export const Handle = DrawerHandle;
  export namespace Handle {
    export type Props = DrawerHandleProps;
  }

  export const Header = DrawerHeader;
  export namespace Header {
    export type Props = DrawerHeaderProps;
  }

  export const Title = DrawerTitle;
  export namespace Title {
    export type Props = DrawerTitleProps;
  }

  export const Description = DrawerDescription;
  export namespace Description {
    export type Props = DrawerDescriptionProps;
  }

  export const Footer = DrawerFooter;
  export namespace Footer {
    export type Props = DrawerFooterProps;
  }

  export const Close = DrawerClose;
  export namespace Close {
    export type Props = DrawerCloseProps;
  }

  export const Style = drawerStyle;
}
