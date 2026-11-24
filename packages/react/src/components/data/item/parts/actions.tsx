'use client';

import { useInternalItemContext } from '../context';
import { Part, type ItemPartProps } from './part';

export type ItemActionsProps = ItemPartProps;

export function ItemActions({ className, ...props }: ItemActionsProps) {
  const { styles } = useInternalItemContext('Item.Actions');
  return <Part {...props} kind="actions" className={styles.actions({ className })} />;
}

ItemActions.displayName = 'Item.Actions';
