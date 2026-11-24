'use client';

import { use, type ComponentProps } from 'react';

import { CollapsedContext, useInternalBreadcrumbContext } from '../context';

export type BreadcrumbItemProps = ComponentProps<'li'>;

export function BreadcrumbItem({ className, children, ...props }: BreadcrumbItemProps) {
  const { styles } = useInternalBreadcrumbContext('Breadcrumb.Item');
  const collapsed = use(CollapsedContext);

  if (collapsed) return children;

  return (
    <li {...props} data-breadcrumb-item="" className={styles.item({ className })}>
      {children}
    </li>
  );
}

BreadcrumbItem.displayName = 'Breadcrumb.Item';
