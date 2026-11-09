'use client';

import { isValidElement, use, type ReactElement, type ReactNode } from 'react';

import { noop } from 'es-toolkit';

import {
  SidebarContext,
  SidebarProviderContext,
  type SidebarContextValue,
  type SidebarControls,
} from './context';
import { SidebarFooter } from './footer';
import { SidebarList } from './group';
import { SidebarHeader } from './header';
import { SidebarItem } from './item';
import { sidebarStyle, type SidebarCollapsibleMode, type SidebarPanelState } from './style';
import { SidebarTrigger } from './trigger';
import { collapsibleModeOf, DEFAULT_SHORTCUT, useSidebar } from './use-sidebar';
import { useTranslate } from '../../../internal/translate';
import { containsElementOfType, elementTypeOf, flattenFragments } from '../../../utils';
import { Card } from '../../data/card';
import { Divider } from '../../layout/divider';
import { ScrollArea } from '../../layout/scroll-area';
import { Drawer } from '../../overlay/drawer';

import type { Sidebar } from '.';

const TRIGGER = new Set<unknown>([SidebarTrigger]);

const isType = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === type;

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

function panelStateOf(
  controls: SidebarControls,
  collapsible: SidebarCollapsibleMode | false,
): SidebarPanelState {
  if (!controls.collapsed) return 'expanded';
  return collapsible === 'icon' ? 'rail' : 'hidden';
}

export function SidebarRoot({
  value,
  variant = 'sidebar',
  collapsible: collapsibleProp,
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  shortcut = DEFAULT_SHORTCUT,
  persist,
  className,
  children,
  'aria-label': ariaLabel,
  ...props
}: Sidebar.Props) {
  const t = useTranslate();
  const provider = use(SidebarProviderContext);
  const collapsible = collapsibleModeOf(collapsibleProp);
  const controls = useSidebar({
    collapsed,
    defaultCollapsed,
    onCollapsedChange,
    collapsible,
    shortcut,
    persist,
    variant,
    provider,
  });

  const label = ariaLabel ?? t('sidebar.label');
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
      <ScrollArea className={styles.scroll()}>
        <nav aria-label={label} className={styles.nav()}>
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
        aria-label={label}
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
      <Drawer
        side="left"
        hideClose
        open={controls.mobileOpen}
        onOpenChange={controls.setMobileOpen}
      >
        <Drawer.Content aria-label={label} className={drawer.styles.drawer()}>
          <SidebarContext value={drawer}>
            {header ?? <SidebarHeader />}
            <nav aria-label={label} className={drawer.styles.drawerNav()}>
              {body}
            </nav>
            {footer}
          </SidebarContext>
        </Drawer.Content>
      </Drawer>
    </>
  );
}
