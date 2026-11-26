'use client';

import { use, type ComponentProps, type ReactNode } from 'react';

import { SidebarListContext, SidebarSortableContext, useInternalSidebarContext } from '../context';
import { linkElementOf } from './link-element';
import { SidebarRow } from './row';
import { SidebarDragFrame } from './sortable';
import { Item } from '../../../data/item';
import { Tooltip } from '../../../overlay/tooltip';
import { type SidebarIconColorScheme } from '../style';
import { SidebarAccordionSubmenu, SidebarMenuSubmenu } from './submenu';
import { linkChildrenOf, splitItemChildren } from '../lib/item-children';
import { TREE_KEY_PROP } from '../lib/tree';

export type SidebarItemProps = Omit<ComponentProps<'a'>, 'children' | 'href'> & {
  value?: string;
  href?: string;
  asChild?: boolean;
  disabled?: boolean;
  colorScheme?: SidebarIconColorScheme;
  children?: ReactNode;
};

export function SidebarItem({
  value,
  href,
  asChild = false,
  disabled = false,
  colorScheme,
  className,
  children,
  onClick,
  ...props
}: SidebarItemProps) {
  const { [TREE_KEY_PROP]: treeKey, ...rest } = props as typeof props & {
    [TREE_KEY_PROP]?: string;
  };
  const sidebar = useInternalSidebarContext('Sidebar.Item');
  const inList = use(SidebarListContext);
  const sortable = use(SidebarSortableContext);
  const parts = splitItemChildren<SidebarItemProps>(
    linkChildrenOf({ asChild, children }),
    SidebarItem,
  );

  const row =
    parts.subItems.length > 0 ? (
      sidebar.rail ? (
        <SidebarMenuSubmenu
          parts={parts}
          disabled={disabled}
          colorScheme={colorScheme}
          className={className}
        />
      ) : (
        <SidebarAccordionSubmenu
          treeKey={treeKey}
          parts={parts}
          disabled={disabled}
          colorScheme={colorScheme}
          className={className}
        />
      )
    ) : (
      <SidebarDragFrame
        dragKey={treeKey}
        preview={<SidebarRow parts={parts} styles={sidebar.styles} colorScheme={colorScheme} />}
      >
        <Tooltip disabled={!sidebar.rail}>
          <Tooltip.Trigger asChild>
            <Item
              asChild
              size="tiny"
              disabled={disabled}
              selected={value !== undefined && value === sidebar.value}
              aria-current={value !== undefined && value === sidebar.value ? 'page' : undefined}
              className={sidebar.styles.item({ className })}
            >
              {linkElementOf(
                { href, asChild, children },
                {
                  'aria-describedby':
                    sortable && treeKey !== undefined ? sortable.hintId : undefined,
                  ...rest,
                  'data-sidebar-item': '',
                  'data-sidebar-value': value,
                  onClick: (event: Parameters<NonNullable<typeof onClick>>[0]) => {
                    onClick?.(event);
                    sidebar.navigate();
                  },
                },
                <SidebarRow parts={parts} styles={sidebar.styles} colorScheme={colorScheme} />,
              )}
            </Item>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">{parts.label}</Tooltip.Content>
        </Tooltip>
      </SidebarDragFrame>
    );

  const listItem = <li className={sidebar.styles.listItem()}>{row}</li>;

  return inList ? listItem : <ul className={sidebar.styles.list()}>{listItem}</ul>;
}

SidebarItem.displayName = 'Sidebar.Item';
