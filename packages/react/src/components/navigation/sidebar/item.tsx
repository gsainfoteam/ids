'use client';

import { use, type ComponentProps, type ReactNode } from 'react';

import { SidebarListContext, SidebarSortableContext, useSidebarContext } from './context';
import { linkChildrenOf, linkElementOf, splitItemChildren } from './item-children';
import { SidebarRow } from './row';
import { SidebarDragFrame } from './sortable';
import { SidebarAccordionSubmenu, SidebarMenuSubmenu } from './submenu';
import { Item } from '../../data/item';
import { Tooltip } from '../../overlay/tooltip';

export type SidebarItemProps = Omit<ComponentProps<'a'>, 'children' | 'href'> & {
  value?: string;
  href?: string;
  asChild?: boolean;
  disabled?: boolean;
  children?: ReactNode;
};

export function SidebarItem({
  value,
  href,
  asChild = false,
  disabled = false,
  className,
  children,
  onClick,
  ...rest
}: SidebarItemProps) {
  const sidebar = useSidebarContext('Sidebar.Item');
  const inList = use(SidebarListContext);
  const sortable = use(SidebarSortableContext);
  const parts = splitItemChildren<SidebarItemProps>(
    linkChildrenOf({ asChild, children }),
    SidebarItem,
  );

  const row =
    parts.subItems.length > 0 ? (
      sidebar.rail ? (
        <SidebarMenuSubmenu parts={parts} disabled={disabled} className={className} />
      ) : (
        <SidebarAccordionSubmenu
          value={value}
          parts={parts}
          disabled={disabled}
          className={className}
        />
      )
    ) : (
      <SidebarDragFrame
        value={value}
        preview={<SidebarRow parts={parts} styles={sidebar.styles} />}
      >
        <Tooltip content={parts.label} side="right" disabled={!sidebar.rail}>
          <Item
            asChild
            interactive
            size="tiny"
            dense
            disabled={disabled}
            selected={value !== undefined && value === sidebar.value}
            aria-current={value !== undefined && value === sidebar.value ? 'page' : undefined}
            className={sidebar.styles.item({ className })}
          >
            {linkElementOf(
              { href, asChild, children },
              {
                'aria-describedby': sortable && value !== undefined ? sortable.hintId : undefined,
                ...rest,
                'data-sidebar-item': '',
                'data-sidebar-value': value,
                onClick: (event: Parameters<NonNullable<typeof onClick>>[0]) => {
                  onClick?.(event);
                  sidebar.navigate();
                },
              },
              <SidebarRow parts={parts} styles={sidebar.styles} />,
            )}
          </Item>
        </Tooltip>
      </SidebarDragFrame>
    );

  const listItem = <li className={sidebar.styles.listItem()}>{row}</li>;

  return inList ? listItem : <ul className={sidebar.styles.list()}>{listItem}</ul>;
}

SidebarItem.displayName = 'Sidebar.Item';
