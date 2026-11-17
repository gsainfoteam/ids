'use client';

import { type MouseEvent } from 'react';

import { Bars3Icon } from '@heroicons/react/24/outline';

import { useNavbarContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { cn } from '../../../utils';
import { IconButton } from '../../action/icon-button';

export type NavbarMenuTriggerProps = Omit<
  IconButton.Props,
  'icon' | 'asChild' | 'children' | 'aria-expanded'
> & { icon?: IconButton.Props['icon'] };

export function NavbarMenuTrigger({
  icon,
  className,
  onClick,
  variant = 'outline',
  ...props
}: NavbarMenuTriggerProps) {
  const t = useTranslate();
  const navbar = useNavbarContext('Navbar.MenuTrigger');

  return (
    <IconButton
      size="tiny"
      {...props}
      variant={variant}
      aria-label={props['aria-label'] ?? t('navbar.open')}
      aria-expanded={navbar.menuOpen}
      icon={icon ?? <Bars3Icon />}
      data-navbar-menu-trigger=""
      className={cn(navbar.styles.menuTrigger(), className)}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) navbar.setMenuOpen(true);
      }}
    />
  );
}

NavbarMenuTrigger.displayName = 'Navbar.MenuTrigger';
