'use client';

import { use, type ComponentProps } from 'react';

import { Menu } from '../../../overlay/menu';
import { Slot } from '../../../utility/slot';
import { CollapsedContext, useInternalBreadcrumbContext } from '../context';

export type BreadcrumbLinkProps = ComponentProps<'a'> & { asChild?: boolean };

export function BreadcrumbLink({ asChild = false, className, ...props }: BreadcrumbLinkProps) {
  const { styles } = useInternalBreadcrumbContext('Breadcrumb.Link');
  const collapsed = use(CollapsedContext);
  const Root = asChild ? Slot : 'a';

  if (collapsed)
    return (
      <Menu.Item asChild>
        <Root {...props} data-breadcrumb-link="" className={className} />
      </Menu.Item>
    );

  return <Root {...props} data-breadcrumb-link="" className={styles.link({ className })} />;
}

BreadcrumbLink.displayName = 'Breadcrumb.Link';
