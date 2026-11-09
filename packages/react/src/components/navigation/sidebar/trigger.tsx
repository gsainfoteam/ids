'use client';

import { use, type MouseEvent } from 'react';

import {
  Bars3Icon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';

import { SidebarContext, useSidebarControls } from './context';
import { toggleSidebar, useSmallScreen } from './use-sidebar';
import { useTranslate } from '../../../internal/translate';
import { cn } from '../../../utils';
import { IconButton } from '../../action/icon-button';
import { Tooltip } from '../../overlay/tooltip';
import { Kbd } from '../../typography/kbd';

export type SidebarTriggerProps = Omit<
  IconButton.Props,
  'icon' | 'asChild' | 'children' | 'aria-expanded'
> & { icon?: IconButton.Props['icon'] };

export function SidebarTrigger({
  icon,
  className,
  onClick,
  variant = 'outline',
  ...props
}: SidebarTriggerProps) {
  const t = useTranslate();
  const controls = useSidebarControls('Sidebar.Trigger');
  const sidebar = use(SidebarContext);
  const small = useSmallScreen();

  if (sidebar?.presentation === 'drawer') return null;
  if (sidebar?.presentation === 'panel' && !controls.collapsible) return null;

  const opensDrawer = small;
  const expanded = opensDrawer ? controls.mobileOpen : !controls.collapsed;
  const label = opensDrawer
    ? t('sidebar.open')
    : controls.collapsed
      ? t('sidebar.expand')
      : t('sidebar.collapse');
  const defaultIcon = opensDrawer ? (
    <Bars3Icon />
  ) : controls.collapsed ? (
    <ChevronDoubleRightIcon />
  ) : (
    <ChevronDoubleLeftIcon />
  );
  const onlyOpensTheDrawer = !controls.collapsible;

  return (
    <Tooltip
      side={controls.inside ? 'right' : 'bottom'}
      content={
        <>
          {label}
          {controls.shortcut && <Kbd keys={controls.shortcut} />}
        </>
      }
    >
      <IconButton
        {...props}
        variant={variant}
        aria-label={props['aria-label'] ?? label}
        aria-expanded={expanded}
        icon={icon ?? defaultIcon}
        data-sidebar-trigger=""
        className={cn(onlyOpensTheDrawer && 'sm:hidden', className)}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggleSidebar(controls, small);
        }}
      />
    </Tooltip>
  );
}

SidebarTrigger.displayName = 'Sidebar.Trigger';
