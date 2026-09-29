'use client';

import { useCardContext } from './context';
import { Part, type CardPartProps } from './part';

export type CardContentProps = CardPartProps;

export function CardContent({ className, ...props }: CardContentProps) {
  const { styles } = useCardContext('Card.Content');
  return <Part {...props} kind="content" className={styles.content({ className })} />;
}

CardContent.displayName = 'Card.Content';
