'use client';

import { Children, isValidElement, type ReactNode } from 'react';

import { SidebarListContext, useInternalSidebarContext } from '../context';
import { SidebarItem } from './item';
import { elementTypeOf } from '../../../../utils';

export function SidebarList({ children }: { children?: ReactNode }) {
  const { styles } = useInternalSidebarContext('Sidebar.Group');

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
