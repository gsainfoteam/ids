'use client';

import { Children, isValidElement, useId, type ComponentProps, type ReactNode } from 'react';

import { SidebarListContext, useSidebarContext } from './context';
import { SidebarItem } from './item';
import { SidebarSortable } from './sortable';
import { elementTypeOf } from '../../../utils';
import { Accordion } from '../../data/accordion';

import type { SidebarItemMove } from './tree';

export type SidebarGroupProps = Omit<ComponentProps<'section'>, 'children'> & {
  label?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  onItemMove?: (move: SidebarItemMove) => void;
  children?: ReactNode;
};

const GROUP = 'group';

export function SidebarList({ children }: { children?: ReactNode }) {
  const { styles } = useSidebarContext('Sidebar.Group');

  return (
    <SidebarListContext value>
      <ul className={styles.list()}>
        {Children.map(children, (child) =>
          isValidElement(child) && elementTypeOf(child) === SidebarItem ? (
            child
          ) : child == null || typeof child === 'boolean' ? (
            child
          ) : (
            <li className={styles.listItem()}>{child}</li>
          ),
        )}
      </ul>
    </SidebarListContext>
  );
}

function SidebarGroupList({
  onItemMove,
  children,
}: Pick<SidebarGroupProps, 'onItemMove' | 'children'>) {
  const { rail, presentation } = useSidebarContext('Sidebar.Group');
  const list = <SidebarList>{children}</SidebarList>;
  if (!onItemMove || rail || presentation === 'drawer') return list;

  return (
    <SidebarSortable items={children} itemType={SidebarItem} onItemMove={onItemMove}>
      {list}
    </SidebarSortable>
  );
}

export function SidebarGroup({
  label,
  collapsible = false,
  defaultOpen = true,
  onItemMove,
  className,
  children,
  ...props
}: SidebarGroupProps) {
  const { styles, rail } = useSidebarContext('Sidebar.Group');
  const labelId = useId();

  if (collapsible && label !== undefined && !rail)
    return (
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpen ? GROUP : null}
        variant="ghost"
        size="tiny"
        data-sidebar-group=""
        className={styles.group({ className })}
      >
        <Accordion.Item value={GROUP}>
          <Accordion.Header asChild>
            <div>
              <Accordion.Trigger className={styles.groupTrigger()}>{label}</Accordion.Trigger>
            </div>
          </Accordion.Header>
          <Accordion.Content className="p-0">
            <SidebarGroupList onItemMove={onItemMove}>{children}</SidebarGroupList>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

  return (
    <section
      {...props}
      aria-labelledby={label !== undefined ? labelId : props['aria-labelledby']}
      data-sidebar-group=""
      className={styles.group({ className })}
    >
      {label !== undefined && (
        <div id={labelId} className={styles.groupLabel()}>
          {label}
        </div>
      )}
      <SidebarGroupList onItemMove={onItemMove}>{children}</SidebarGroupList>
    </section>
  );
}

SidebarGroup.displayName = 'Sidebar.Group';
