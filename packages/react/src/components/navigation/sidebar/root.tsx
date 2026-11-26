'use client';

import { use, type ReactElement, type ReactNode } from 'react';

import { noop } from 'es-toolkit';

import { SidebarContext, SidebarProviderContext, type SidebarContextValue } from './context';
import { SIDEBAR_WITHOUT_COLLAPSE, useInternalSidebar } from './hooks/use-sidebar';
import { isType } from './lib/is-type';
import { panelStateOf } from './lib/panel-state';
import { SidebarFooter } from './parts/footer';
import { SidebarHeader } from './parts/header';
import { SidebarItem } from './parts/item';
import { SidebarList } from './parts/list';
import { SidebarTrigger } from './parts/trigger';
import { sidebarStyle } from './style';
import { useInternalRequiredName } from '../../../internal/lib/accessible-name';
import { containsElementOfType, flattenFragments } from '../../../utils';
import { Card } from '../../data/card';
import { Divider } from '../../layout/divider';
import { ScrollArea } from '../../layout/scroll-area';
import { Drawer } from '../../overlay/drawer';

import type { Sidebar } from '.';

const TRIGGER = new Set<unknown>([SidebarTrigger]);

function splitChildren(children: ReactNode) {
  const nodes = flattenFragments(children);
  const body: ReactNode[] = [];
  let run: ReactElement[] = [];

  const closeRun = () => {
    if (run.length > 0) body.push(<SidebarList key={`list-${body.length}`}>{run}</SidebarList>);
    run = [];
  };

  for (const node of nodes) {
    if (isType(SidebarHeader)(node) || isType(SidebarFooter)(node)) continue;
    if (isType(SidebarItem)(node)) run.push(node as ReactElement);
    else {
      closeRun();
      body.push(node);
    }
  }
  closeRun();

  return {
    header: nodes.find(isType(SidebarHeader)),
    footer: nodes.find(isType(SidebarFooter)),
    body,
  };
}

export function SidebarRoot({
  value,
  variant = 'sidebar',
  sidebar = SIDEBAR_WITHOUT_COLLAPSE,
  className,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: Sidebar.Props) {
  const name = { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy };
  useInternalRequiredName('Sidebar', name);

  const provider = use(SidebarProviderContext);
  const { collapse, shortcut } = sidebar;
  const collapsible = collapse?.mode ?? false;
  const controls = useInternalSidebar({
    collapsed: collapse?.collapsed,
    defaultCollapsed: collapse?.defaultCollapsed,
    onCollapsedChange: collapse?.onCollapsedChange,
    collapsible,
    shortcut,
    persist: collapse?.persist,
    variant,
    provider,
  });

  const state = panelStateOf(controls, collapsible);
  const standalone = provider === null;
  const styles = sidebarStyle({ variant, state, standalone });
  const { header, body, footer } = splitChildren(children);
  const addsHeader =
    header === undefined && collapsible !== false && !containsElementOfType(children, TRIGGER);

  const shared = { ...controls, value, variant };
  const panel: SidebarContextValue = {
    ...shared,
    presentation: 'panel',
    rail: state === 'rail',
    styles,
    navigate: noop,
  };
  const drawer: SidebarContextValue = {
    ...shared,
    presentation: 'drawer',
    rail: false,
    styles: sidebarStyle({ variant: 'sidebar', state: 'expanded', touch: true }),
    navigate: () => controls.setMobileOpen(false),
  };
  const bar: SidebarContextValue = { ...panel, presentation: 'bar' };

  const panelContent = (
    <>
      {header ?? (addsHeader && <SidebarHeader />)}
      <ScrollArea fade="y" className={styles.scroll()}>
        <nav {...name} className={styles.nav()}>
          {body}
        </nav>
      </ScrollArea>
      {footer}
    </>
  );
  const panelProps = {
    'data-sidebar-panel': '',
    inert: state === 'hidden' || undefined,
  };

  return (
    <>
      <aside
        {...props}
        {...name}
        data-sidebar=""
        data-sidebar-variant={variant}
        data-collapsible={collapsible || undefined}
        data-collapsed={controls.collapsed ? '' : undefined}
        className={styles.root({ className })}
      >
        {standalone && (
          <SidebarContext value={bar}>
            <div className={styles.mobileBar()}>
              <SidebarTrigger />
            </div>
          </SidebarContext>
        )}
        <SidebarContext value={panel}>
          {variant === 'floating' ? (
            <Card asChild variant="outline" size="tiny" className={styles.panel()}>
              <div {...panelProps}>{panelContent}</div>
            </Card>
          ) : (
            <div {...panelProps} className={styles.panel()}>
              {panelContent}
            </div>
          )}
        </SidebarContext>
        {variant === 'sidebar' && <Divider orientation="vertical" className={styles.divider()} />}
      </aside>
      <Drawer side="left" open={controls.mobileOpen} onOpenChange={controls.setMobileOpen}>
        <Drawer.Content {...name} className={drawer.styles.drawer()}>
          <SidebarContext value={drawer}>
            {header ?? <SidebarHeader />}
            <nav {...name} className={drawer.styles.drawerNav()}>
              {body}
            </nav>
            {footer}
          </SidebarContext>
        </Drawer.Content>
      </Drawer>
    </>
  );
}
