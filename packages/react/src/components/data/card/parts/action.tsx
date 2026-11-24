'use client';

import { useInternalCardContext } from '../context';
import { Part, type CardPartProps } from './part';

export type CardActionProps = CardPartProps;

export function CardAction({ className, ...props }: CardActionProps) {
  const { styles } = useInternalCardContext('Card.Action');
  return <Part {...props} kind="action" className={styles.action({ className })} />;
}

CardAction.displayName = 'Card.Action';
