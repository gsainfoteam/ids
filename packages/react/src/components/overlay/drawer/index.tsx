import { type ReactNode } from 'react';

import {
  type DrawerController,
  type DrawerSnap,
  type DrawerSnapOptions,
  type UseDrawerOptions,
} from './hooks/use-drawer';
import { DrawerClose, type DrawerCloseProps } from './parts/close';
import { DrawerContent, type DrawerContentProps } from './parts/content';
import { DrawerDescription, type DrawerDescriptionProps } from './parts/description';
import { DrawerFooter, type DrawerFooterProps } from './parts/footer';
import { DrawerHandle, type DrawerHandleProps } from './parts/handle';
import { DrawerHeader, type DrawerHeaderProps } from './parts/header';
import { DrawerOverlay, type DrawerOverlayProps } from './parts/overlay';
import { DrawerTitle, type DrawerTitleProps } from './parts/title';
import { DrawerTrigger, type DrawerTriggerProps } from './parts/trigger';
import { DrawerRoot } from './root';
import { drawerStyle } from './style';

import type { DrawerSide, SnapPoint as DrawerSnapPoint } from './lib/drawer-gesture';

export function Drawer(props: Drawer.Props) {
  return <DrawerRoot {...props} />;
}

export namespace Drawer {
  export type Role = 'dialog' | 'alertdialog';
  export type Side = DrawerSide;
  export type SnapPoint = DrawerSnapPoint;
  export type Options = UseDrawerOptions;
  export type SnapOptions = DrawerSnapOptions;
  export type Snap = DrawerSnap;
  export type Controller = DrawerController;

  export type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpenChangeComplete?: (open: boolean) => void;
    dismissible?: boolean;
    role?: Role;
    side?: Side;
    modal?: boolean;
    drawer?: Controller;
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
