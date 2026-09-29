'use client';

import { use, type ComponentProps } from 'react';

import { CollapsedContext, useBreadcrumbContext } from './context';
import { Menu } from '../../overlay/menu';
import { Slot } from '../../utility/slot';

export type BreadcrumbPageProps = ComponentProps<'span'> & { asChild?: boolean };

export function BreadcrumbPage({ asChild = false, className, ...props }: BreadcrumbPageProps) {
  const { styles } = useBreadcrumbContext('Breadcrumb.Page');
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
