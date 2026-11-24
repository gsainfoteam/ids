'use client';

import { use, type ComponentProps } from 'react';

import { Divider } from '../../../layout/divider';
import { ItemGroupContext } from '../context';

export type ItemSeparatorProps = ComponentProps<'hr'>;

export function ItemSeparator({ className, ...props }: ItemSeparatorProps) {
  const inGroup = use(ItemGroupContext) !== null;
  if (inGroup)
    return (
      <Divider asChild aria-hidden data-item-separator="" className={className}>
        <li />
      </Divider>
    );
  return (
    <Divider asChild data-item-separator="" className={className}>
      <hr {...props} />
    </Divider>
  );
}

ItemSeparator.displayName = 'Item.Separator';
