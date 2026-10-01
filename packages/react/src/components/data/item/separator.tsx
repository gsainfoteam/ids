'use client';

import { use, type ComponentProps } from 'react';

import { ItemGroupContext } from './context';
import { Divider } from '../../layout/divider';

export type ItemSeparatorProps = ComponentProps<'hr'>;

export function ItemSeparator({ className, ...props }: ItemSeparatorProps) {
  const inGroup = use(ItemGroupContext) !== null;
  if (inGroup)
    return (
      <Divider asChild decorative data-item-separator="" className={className}>
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
