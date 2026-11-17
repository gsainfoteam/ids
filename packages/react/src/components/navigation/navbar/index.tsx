import { type ComponentProps, type ReactNode } from 'react';

import { NavbarItem, type NavbarItemProps } from './item';
import { NavbarMenuTrigger, type NavbarMenuTriggerProps } from './menu-trigger';
import { NavbarNav, type NavbarNavProps } from './nav';
import { NavbarRoot } from './root';
import { navbarStyle } from './style';

export function Navbar(props: Navbar.Props) {
  return <NavbarRoot {...props} />;
}

export namespace Navbar {
  export type Props = Omit<ComponentProps<'header'>, 'children'> & {
    value?: string;
    sticky?: boolean;
    bordered?: boolean;
    children?: ReactNode;
  };

  export const Nav = NavbarNav;
  export namespace Nav {
    export type Props = NavbarNavProps;
  }

  export const Item = NavbarItem;
  export namespace Item {
    export type Props = NavbarItemProps;
  }

  export const MenuTrigger = NavbarMenuTrigger;
  export namespace MenuTrigger {
    export type Props = NavbarMenuTriggerProps;
  }

  export const Style = navbarStyle;
}
