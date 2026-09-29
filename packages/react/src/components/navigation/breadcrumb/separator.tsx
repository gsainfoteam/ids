'use client';

import { use, type ComponentProps } from 'react';

import { ChevronRightIcon } from '@heroicons/react/16/solid';

import { CollapsedContext, useBreadcrumbContext } from './context';

export type BreadcrumbSeparatorProps = ComponentProps<'li'>;

export function BreadcrumbSeparator({ className, children, ...props }: BreadcrumbSeparatorProps) {
  const { styles, separator } = useBreadcrumbContext('Breadcrumb.Separator');
  const collapsed = use(CollapsedContext);

  if (collapsed) return null;

  return (
    <li
      aria-hidden="true"
      {...props}
      data-breadcrumb-separator=""
      className={styles.separator({ className })}
    >
      {children ?? separator ?? <ChevronRightIcon />}
    </li>
  );
}

BreadcrumbSeparator.displayName = 'Breadcrumb.Separator';
