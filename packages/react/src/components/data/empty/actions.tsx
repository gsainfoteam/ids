'use client';

import { useEmptyContext } from './context';
import { Part, type EmptyPartProps } from './part';

export type EmptyActionsProps = EmptyPartProps;

export function EmptyActions({ className, ...props }: EmptyActionsProps) {
  const { styles } = useEmptyContext('Empty.Actions');
  return <Part {...props} kind="actions" className={styles.actions({ className })} />;
}

EmptyActions.displayName = 'Empty.Actions';
