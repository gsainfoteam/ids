'use client';

import { useCardContext } from './context';
import { Part, type CardPartProps } from './part';
import { useRegisteredId } from '../../../internal/surface';

export type CardTitleProps = CardPartProps;

export function CardTitle({ className, id, ...props }: CardTitleProps) {
  const { styles, setTitleId } = useCardContext('Card.Title');
  const titleId = useRegisteredId(setTitleId, id);
  return <Part {...props} id={titleId} kind="title" className={styles.title({ className })} />;
}

CardTitle.displayName = 'Card.Title';
