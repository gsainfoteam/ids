import { type ComponentProps, type ReactNode } from 'react';

import { SidebarFooter, type SidebarFooterProps } from './footer';
import { SidebarGroup, type SidebarGroupProps } from './group';
import { SidebarHeader, type SidebarHeaderProps } from './header';
import { SidebarInset, type SidebarInsetProps } from './inset';
import { SidebarItem, type SidebarItemProps } from './item';
import { SidebarProvider, type SidebarProviderProps } from './provider';
import { SidebarRoot } from './root';
import { sidebarStyle, type SidebarCollapsibleMode, type SidebarVariant } from './style';
import { SidebarTrigger, type SidebarTriggerProps } from './trigger';

import type { Hotkey } from '@tanstack/react-hotkeys';

export function Sidebar(props: Sidebar.Props) {
  return <SidebarRoot {...props} />;
}

export namespace Sidebar {
  export type Variant = SidebarVariant;
  export type CollapsibleMode = SidebarCollapsibleMode;

  export type Props = Omit<ComponentProps<'aside'>, 'children'> & {
    value?: string;
    variant?: Variant;
    collapsible?: boolean | CollapsibleMode;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    shortcut?: Hotkey | false;
    persist?: string;
    children?: ReactNode;
  };

  export const Header = SidebarHeader;
  export namespace Header {
    export type Props = SidebarHeaderProps;
  }

  export const Group = SidebarGroup;
  export namespace Group {
    export type Props = SidebarGroupProps;
  }

  export const Item = SidebarItem;
  export namespace Item {
    export type Props = SidebarItemProps;
  }

  export const Footer = SidebarFooter;
  export namespace Footer {
    export type Props = SidebarFooterProps;
  }

  export const Trigger = SidebarTrigger;
  export namespace Trigger {
    export type Props = SidebarTriggerProps;
  }

  export const Provider = SidebarProvider;
  export namespace Provider {
    export type Props = SidebarProviderProps;
  }

  export const Inset = SidebarInset;
  export namespace Inset {
    export type Props = SidebarInsetProps;
  }

  export const Style = sidebarStyle;
}

export type { SidebarCollapsibleMode, SidebarVariant } from './style';
