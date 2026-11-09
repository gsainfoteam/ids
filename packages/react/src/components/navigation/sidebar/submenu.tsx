'use client';

import { type ReactElement } from 'react';

import { SidebarListContext, useSidebarContext } from './context';
import {
  containsValue,
  linkChildrenOf,
  linkElementOf,
  splitItemChildren,
  type ItemParts,
} from './item-children';
import { SidebarRow } from './row';
import { cn, elementTypeOf } from '../../../utils';
import { Accordion } from '../../data/accordion';
import { Item } from '../../data/item';
import { Menu } from '../../overlay/menu';

import type { SidebarItemProps } from './item';

const SUBMENU = 'submenu';

type SubmenuProps = {
  parts: ItemParts<SidebarItemProps>;
  disabled: boolean;
  className: string | undefined;
};

export function SidebarAccordionSubmenu({ parts, disabled, className }: SubmenuProps) {
  const sidebar = useSidebarContext('Sidebar.Item');
  const holdsCurrent = containsValue(parts.subItems, sidebar.value);

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={holdsCurrent ? SUBMENU : null}
      variant="ghost"
      size="tiny"
      disabled={disabled}
      className="gap-0"
    >
      <Accordion.Item value={SUBMENU}>
        <Accordion.Header asChild>
          <div>
            <Item
              asChild
              interactive
              size="tiny"
              dense
              disabled={disabled}
              className={sidebar.styles.item({
                className: cn(sidebar.styles.submenuTrigger(), className),
              })}
            >
              <Accordion.Trigger data-sidebar-item="">
                <SidebarRow parts={parts} styles={sidebar.styles} />
              </Accordion.Trigger>
            </Item>
          </div>
        </Accordion.Header>
        <Accordion.Content className="p-0">
          <SidebarListContext value>
            <ul className={sidebar.styles.subList()}>{parts.subItems}</ul>
          </SidebarListContext>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

function SidebarMenuLink({ item }: { item: ReactElement<SidebarItemProps> }) {
  const sidebar = useSidebarContext('Sidebar.Item');
  const { value, href, asChild, disabled, children, className, ...rest } = item.props;
  const parts = splitItemChildren(linkChildrenOf({ asChild, children }), elementTypeOf(item));
  const current = value !== undefined && value === sidebar.value;

  return (
    <Menu.Item asChild disabled={disabled} className={className}>
      {linkElementOf(
        { href, asChild, children },
        { ...rest, 'aria-current': current ? 'page' : undefined },
        <>
          {parts.icon}
          {parts.label}
          {parts.end}
        </>,
      )}
    </Menu.Item>
  );
}

export function SidebarMenuSubmenu({ parts, disabled, className }: SubmenuProps) {
  const sidebar = useSidebarContext('Sidebar.Item');

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Item
          asChild
          interactive
          size="tiny"
          dense
          disabled={disabled}
          selected={containsValue(parts.subItems, sidebar.value)}
          className={sidebar.styles.item({ className })}
        >
          <button type="button" disabled={disabled} data-sidebar-item="">
            <SidebarRow parts={parts} styles={sidebar.styles} />
          </button>
        </Item>
      </Menu.Trigger>
      <Menu.Content side="right" align="start">
        <Menu.Label>{parts.label}</Menu.Label>
        {parts.subItems.map((subItem, index) => (
          <SidebarMenuLink key={subItem.key ?? index} item={subItem} />
        ))}
      </Menu.Content>
    </Menu>
  );
}
