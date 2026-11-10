'use client';

import { use, useState, type ReactElement } from 'react';

import {
  SidebarFoldedContext,
  SidebarListContext,
  SidebarSortableContext,
  useSidebarContext,
} from './context';
import {
  containsValue,
  linkChildrenOf,
  linkElementOf,
  splitItemChildren,
  type ItemParts,
} from './item-children';
import { SidebarRow } from './row';
import { SidebarDragFrame } from './sortable';
import { cn, elementTypeOf } from '../../../utils';
import { Accordion } from '../../data/accordion';
import { Item } from '../../data/item';
import { Divider } from '../../layout/divider';
import { Menu } from '../../overlay/menu';

import type { SidebarItemProps } from './item';

const SUBMENU = 'submenu';

type SubmenuProps = {
  value?: string;
  parts: ItemParts<SidebarItemProps>;
  disabled: boolean;
  className: string | undefined;
};

export function SidebarAccordionSubmenu({ value, parts, disabled, className }: SubmenuProps) {
  const sidebar = useSidebarContext('Sidebar.Item');
  const sortable = use(SidebarSortableContext);
  const folded = use(SidebarFoldedContext);
  const revealed = sortable?.revealed ?? null;
  const [open, setOpen] = useState(
    () =>
      containsValue(parts.subItems, sidebar.value) ||
      containsValue(parts.subItems, revealed?.value),
  );
  const [seenReveal, setSeenReveal] = useState(revealed?.times);

  if (revealed && revealed.times !== seenReveal) {
    setSeenReveal(revealed.times);
    if (containsValue(parts.subItems, revealed.value)) setOpen(true);
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={open ? SUBMENU : null}
      onValueChange={(next) => setOpen(next === SUBMENU)}
      variant="ghost"
      size="tiny"
      disabled={disabled}
      className="gap-0"
    >
      <Accordion.Item value={SUBMENU}>
        <Accordion.Header asChild>
          <div>
            <SidebarDragFrame
              value={value}
              preview={<SidebarRow parts={parts} styles={sidebar.styles} />}
            >
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
                <Accordion.Trigger
                  aria-describedby={sortable && value !== undefined ? sortable.hintId : undefined}
                  data-sidebar-item=""
                  data-sidebar-value={value}
                >
                  <SidebarRow parts={parts} styles={sidebar.styles} />
                </Accordion.Trigger>
              </Item>
            </SidebarDragFrame>
          </div>
        </Accordion.Header>
        <Accordion.Content className="p-0">
          <div className={sidebar.styles.subTree()}>
            <Divider orientation="vertical" decorative />
            <SidebarFoldedContext value={folded || !open}>
              <SidebarListContext value>
                <ul className={sidebar.styles.subList()}>{parts.subItems}</ul>
              </SidebarListContext>
            </SidebarFoldedContext>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

function SidebarMenuEntry({ item }: { item: ReactElement<SidebarItemProps> }) {
  const sidebar = useSidebarContext('Sidebar.Item');
  const { value, href, asChild, disabled, children, className, ...rest } = item.props;
  const parts = splitItemChildren<SidebarItemProps>(
    linkChildrenOf({ asChild, children }),
    elementTypeOf(item),
  );
  const current = value !== undefined && value === sidebar.value;

  if (parts.subItems.length > 0)
    return (
      <Menu>
        <Menu.Trigger disabled={disabled} className={className}>
          {parts.icon}
          {parts.label}
        </Menu.Trigger>
        <Menu.Content>
          {parts.subItems.map((subItem, index) => (
            <SidebarMenuEntry key={subItem.key ?? index} item={subItem} />
          ))}
        </Menu.Content>
      </Menu>
    );

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
          <SidebarMenuEntry key={subItem.key ?? index} item={subItem} />
        ))}
      </Menu.Content>
    </Menu>
  );
}
