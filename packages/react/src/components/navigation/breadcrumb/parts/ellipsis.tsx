'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid';

import { useInternalTranslate } from '../../../../internal/translate';
import { IconButton } from '../../../action/icon-button';
import { Menu } from '../../../overlay/menu';
import { CollapsedContext, useInternalBreadcrumbContext } from '../context';

export type BreadcrumbEllipsisProps = Omit<ComponentProps<'button'>, 'children'> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

export function BreadcrumbEllipsis({
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
  ...props
}: BreadcrumbEllipsisProps) {
  const { styles } = useInternalBreadcrumbContext('Breadcrumb.Ellipsis');
  const t = useInternalTranslate();

  return (
    <li data-breadcrumb-item="" data-breadcrumb-ellipsis="" className={styles.item()}>
      <Menu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <Menu.Trigger asChild>
          <IconButton
            aria-label={t('breadcrumb.more')}
            {...props}
            variant="ghost"
            icon={<EllipsisHorizontalIcon aria-hidden="true" />}
            className={styles.ellipsis({ className })}
          />
        </Menu.Trigger>
        <Menu.Content>
          <CollapsedContext value={true}>{children}</CollapsedContext>
        </Menu.Content>
      </Menu>
    </li>
  );
}

BreadcrumbEllipsis.displayName = 'Breadcrumb.Ellipsis';
