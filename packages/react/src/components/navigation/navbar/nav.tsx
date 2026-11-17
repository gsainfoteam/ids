'use client';

import { type ComponentProps } from 'react';

import { useNavbarContext } from './context';
import { useTranslate } from '../../../internal/translate';

export type NavbarNavProps = ComponentProps<'nav'>;

export function NavbarNav({
  className,
  children,
  'aria-label': ariaLabel,
  ...props
}: NavbarNavProps) {
  const t = useTranslate();
  const { presentation, styles } = useNavbarContext('Navbar.Nav');
  const inDrawer = presentation === 'drawer';

  return (
    <nav
      {...props}
      aria-label={ariaLabel ?? t('navbar.label')}
      data-navbar-nav=""
      className={inDrawer ? styles.drawerNav({ className }) : styles.nav({ className })}
    >
      <ul className={inDrawer ? styles.drawerList() : styles.list()}>{children}</ul>
    </nav>
  );
}

NavbarNav.displayName = 'Navbar.Nav';
