'use client';

import { isValidElement, useState, type ReactElement, type ReactNode } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { NavbarContext, type NavbarContextValue } from './context';
import { NavbarMenuTrigger } from './menu-trigger';
import { NavbarNav, type NavbarNavProps } from './nav';
import { navbarStyle } from './style';
import { useDrawerPresentation } from '../../../internal/overlay';
import { useTranslate } from '../../../internal/translate';
import { containsElementOfType, elementTypeOf, flattenFragments } from '../../../utils';
import { IconButton } from '../../action/icon-button';
import { Divider } from '../../layout/divider';
import { Drawer } from '../../overlay/drawer';

import type { Navbar } from '.';

const MENU_TRIGGER = new Set<unknown>([NavbarMenuTrigger]);

const isNav = (node: ReactNode): node is ReactElement<NavbarNavProps> =>
  isValidElement(node) && elementTypeOf(node) === NavbarNav;

function splitChildren(children: ReactNode) {
  const nodes = flattenFragments(children);
  const at = nodes.findIndex(isNav);
  if (at === -1) return { start: nodes, nav: undefined, end: [] };

  return {
    start: nodes.slice(0, at),
    nav: nodes[at] as ReactElement<NavbarNavProps>,
    end: nodes.slice(at + 1),
  };
}

function useMenuThatClosesOnWideScreens() {
  const [menuOpen, setMenuOpen] = useState(false);
  const small = useDrawerPresentation('drawer');

  if (!small && menuOpen) setMenuOpen(false);

  return [menuOpen, setMenuOpen] as const;
}

export function NavbarRoot({
  value,
  sticky = false,
  bordered = true,
  className,
  children,
  ...props
}: Navbar.Props) {
  const t = useTranslate();
  const [menuOpen, setMenuOpen] = useMenuThatClosesOnWideScreens();

  const styles = navbarStyle({ sticky });
  const { start, nav, end } = splitChildren(children);
  const addsMenuTrigger = nav !== undefined && !containsElementOfType(children, MENU_TRIGGER);
  const label = nav?.props['aria-label'] ?? t('navbar.label');

  const bar: NavbarContextValue = { value, presentation: 'bar', styles, menuOpen, setMenuOpen };
  const drawer: NavbarContextValue = { ...bar, presentation: 'drawer' };

  return (
    <header
      {...props}
      data-navbar=""
      data-sticky={sticky ? '' : undefined}
      className={styles.root({ className })}
    >
      <NavbarContext value={bar}>
        <div className={styles.bar()}>
          {addsMenuTrigger && <NavbarMenuTrigger />}
          {start.length > 0 && <div className={styles.start()}>{start}</div>}
          {nav}
          {end.length > 0 && <div className={styles.end()}>{end}</div>}
        </div>
      </NavbarContext>
      {bordered && <Divider decorative />}
      {nav && (
        <Drawer side="left" hideClose open={menuOpen} onOpenChange={setMenuOpen}>
          <Drawer.Content aria-label={label} className={styles.drawer()}>
            <div className={styles.drawerHeader()}>
              <Drawer.Close asChild>
                <IconButton
                  size="tiny"
                  variant="outline"
                  aria-label={t('drawer.close')}
                  icon={<XMarkIcon />}
                />
              </Drawer.Close>
            </div>
            <NavbarContext value={drawer}>{nav}</NavbarContext>
          </Drawer.Content>
        </Drawer>
      )}
    </header>
  );
}
