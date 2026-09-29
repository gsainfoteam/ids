'use client';

import { useEmptyContext } from './context';
import { Part, type EmptyPartProps } from './part';

export type EmptyDescriptionProps = EmptyPartProps;

export function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
  const { styles } = useEmptyContext('Empty.Description');
  return <Part {...props} kind="description" className={styles.description({ className })} />;
}

EmptyDescription.displayName = 'Empty.Description';
