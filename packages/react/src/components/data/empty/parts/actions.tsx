'use client';

import { useInternalEmptyContext } from '../context';
import { Part, type EmptyPartProps } from './part';

export type EmptyActionsProps = EmptyPartProps;

export function EmptyActions({ className, ...props }: EmptyActionsProps) {
  const { styles } = useInternalEmptyContext('Empty.Actions');
  return <Part {...props} kind="actions" className={styles.actions({ className })} />;
}

EmptyActions.displayName = 'Empty.Actions';
