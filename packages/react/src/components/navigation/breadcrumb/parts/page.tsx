'use client';

import { use, type ComponentProps } from 'react';

import { Menu } from '../../../overlay/menu';
import { Slot } from '../../../utility/slot';
import { CollapsedContext, useInternalBreadcrumbContext } from '../context';

export type BreadcrumbPageProps = ComponentProps<'span'> & { asChild?: boolean };

export function BreadcrumbPage({ asChild = false, className, ...props }: BreadcrumbPageProps) {
  const { styles } = useInternalBreadcrumbContext('Breadcrumb.Page');
  const collapsed = use(CollapsedContext);
  const Root = asChild ? Slot : 'span';

  if (collapsed)
    return (
      <Menu.Item asChild>
        <Root {...props} aria-current="page" data-breadcrumb-page="" className={className} />
      </Menu.Item>
    );

  return (
    <Root
      {...props}
      aria-current="page"
      data-breadcrumb-page=""
      className={styles.page({ className })}
    />
  );
}

BreadcrumbPage.displayName = 'Breadcrumb.Page';
