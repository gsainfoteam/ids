import { type ComponentProps, type ReactNode } from 'react';

import { SidebarFooter, type SidebarFooterProps } from './parts/footer';
import {
  SidebarGroup,
  type SidebarGroupItemState,
  type SidebarGroupItemsProps,
  type SidebarGroupProps,
} from './parts/group';
import { SidebarHeader, type SidebarHeaderProps } from './parts/header';
import { SidebarInset, type SidebarInsetProps } from './parts/inset';
import { SidebarItem, type SidebarItemProps } from './parts/item';
import { SidebarProvider, type SidebarProviderProps } from './parts/provider';
import { SidebarTrigger, type SidebarTriggerProps } from './parts/trigger';
import { SidebarRoot } from './root';
import { sidebarStyle, type SidebarCollapsibleMode, type SidebarVariant } from './style';
import { findElementOfType } from '../../../utils';

import type { SidebarMove, SidebarPlace, SidebarTreeItem } from './lib/tree';
import type { AccessibleName } from '../../../internal/lib/accessible-name';
import type { Hotkey } from '@tanstack/react-hotkeys';

export function Sidebar(props: Sidebar.Props) {
  return <SidebarRoot {...props} />;
}

const SIDEBARS = new Set<unknown>([Sidebar, SidebarRoot]);

export namespace Sidebar {
  export type Variant = SidebarVariant;
  export type CollapsibleMode = SidebarCollapsibleMode;

  export type Props = Omit<ComponentProps<'aside'>, 'children'> &
    AccessibleName & {
      value?: string;
      variant?: Variant;
      collapsible?: CollapsibleMode;
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

  export type TreeItem<T> = SidebarTreeItem<T>;

  export const Group = SidebarGroup;
  export namespace Group {
    export type Props = SidebarGroupProps;
    export type ItemsProps<T extends TreeItem<T>> = SidebarGroupItemsProps<T>;
    export type ItemState = SidebarGroupItemState;
    export type Move<T> = SidebarMove<T>;
    export type Place<T> = SidebarPlace<T>;
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

  export function Provider({ children, ...props }: Provider.Props) {
    const sidebar = findElementOfType<Sidebar.Props>(children, SIDEBARS);

    return (
      <SidebarProvider {...props} sidebarVariant={sidebar?.props.variant}>
        {children}
      </SidebarProvider>
    );
  }

  Provider.displayName = 'Sidebar.Provider';

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
