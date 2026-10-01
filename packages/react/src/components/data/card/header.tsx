'use client';

import { useCardContext } from './context';
import { Part, type CardPartProps } from './part';

export type CardHeaderProps = CardPartProps;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  const { styles } = useCardContext('Card.Header');
  return <Part {...props} kind="header" className={styles.header({ className })} />;
}

CardHeader.displayName = 'Card.Header';
