import { type ComponentProps, type ReactNode } from 'react';

import { SidebarFooter, type SidebarFooterProps } from './parts/footer';
import { SidebarGroup, type SidebarGroupCollapse, type SidebarGroupProps } from './parts/group';
import { SidebarGroupLabel, type SidebarGroupLabelProps } from './parts/group-label';
import {
  SidebarGroupTree,
  type SidebarGroupItemState,
  type SidebarGroupTreeProps,
  type SidebarGroupTreeSortable,
} from './parts/group-tree';
import { SidebarHeader, type SidebarHeaderProps } from './parts/header';
import { SidebarInset, type SidebarInsetProps } from './parts/inset';
import { SidebarItem, type SidebarItemProps } from './parts/item';
import { SidebarProvider, type SidebarProviderProps } from './parts/provider';
import { SidebarTrigger, type SidebarTriggerProps } from './parts/trigger';
import { SidebarRoot } from './root';
import { sidebarStyle, type SidebarCollapsibleMode, type SidebarVariant } from './style';
import { findElementOfType } from '../../../utils';

import type { SidebarInstance } from './hooks/use-sidebar';
import type { SidebarMove, SidebarPlace, SidebarTreeItem } from './lib/tree';
import type { AccessibleName } from '../../../internal/lib/accessible-name';

export function Sidebar(props: Sidebar.Props) {
  return <SidebarRoot {...props} />;
}

const SIDEBARS = new Set<unknown>([Sidebar, SidebarRoot]);

export namespace Sidebar {
  export type Variant = SidebarVariant;
  export type CollapsibleMode = SidebarCollapsibleMode;
  export type Instance = SidebarInstance;

  export type Props = Omit<ComponentProps<'aside'>, 'children'> &
    AccessibleName & {
      value?: string;
      variant?: Variant;
      sidebar?: Instance;
      children?: ReactNode;
    };

  export const Header = SidebarHeader;
  export namespace Header {
    export type Props = SidebarHeaderProps;
  }

  export type TreeItem<T> = SidebarTreeItem<T>;

  export function Group(props: Group.Props) {
    return <SidebarGroup {...props} />;
  }

  Group.displayName = 'Sidebar.Group';

  export namespace Group {
    export type Props = SidebarGroupProps;
    export type Collapse = SidebarGroupCollapse;
    export type LabelProps = SidebarGroupLabelProps;
    export type TreeProps<T extends TreeItem<T>> = SidebarGroupTreeProps<T>;
    export type ItemState = SidebarGroupItemState;
    export type Sortable<T> = SidebarGroupTreeSortable<T>;
    export type Move<T> = SidebarMove<T>;
    export type Place<T> = SidebarPlace<T>;

    export const Label = SidebarGroupLabel;
    export namespace Label {
      export type Props = SidebarGroupLabelProps;
    }

    export const Tree = SidebarGroupTree;
    export namespace Tree {
      export type Props<T extends TreeItem<T>> = SidebarGroupTreeProps<T>;
    }
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
export { useSidebar } from './hooks/use-sidebar';
export type { SidebarCollapse, SidebarInstance, SidebarOptions } from './hooks/use-sidebar';
