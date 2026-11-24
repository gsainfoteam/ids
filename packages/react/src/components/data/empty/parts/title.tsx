'use client';

import { useInternalEmptyContext } from '../context';
import { Part, type EmptyPartProps } from './part';

export type EmptyTitleProps = EmptyPartProps;

export function EmptyTitle({ className, ...props }: EmptyTitleProps) {
  const { styles } = useInternalEmptyContext('Empty.Title');
  return <Part {...props} kind="title" className={styles.title({ className })} />;
}

EmptyTitle.displayName = 'Empty.Title';
