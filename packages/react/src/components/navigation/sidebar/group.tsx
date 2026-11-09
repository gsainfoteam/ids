'use client';

import { Children, isValidElement, useId, type ComponentProps, type ReactNode } from 'react';

import { SidebarListContext, useSidebarContext } from './context';
import { SidebarItem } from './item';
import { elementTypeOf } from '../../../utils';
import { Accordion } from '../../data/accordion';

export type SidebarGroupProps = Omit<ComponentProps<'section'>, 'children'> & {
  label?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
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

export function SidebarGroup({
  label,
  collapsible = false,
  defaultOpen = true,
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
            <SidebarList>{children}</SidebarList>
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
      <SidebarList>{children}</SidebarList>
    </section>
  );
}

SidebarGroup.displayName = 'Sidebar.Group';
