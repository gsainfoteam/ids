'use client';

import { useCardContext } from './context';
import { Part, type CardPartProps } from './part';
import { useRegisteredId } from '../../../internal/surface';
import { titleContent } from '../../../internal/surface-trigger';

export type CardTitleProps = CardPartProps;

export function CardTitle({ className, id, asChild, children, ...props }: CardTitleProps) {
  const { styles, trigger, setTitleId } = useCardContext('Card.Title');
  const titleId = useRegisteredId(setTitleId, id);
  return (
    <Part
      {...props}
      asChild={asChild}
      id={titleId}
      kind="title"
      className={styles.title({ className })}
    >
      {titleContent({ trigger, asChild, children })}
    </Part>
  );
}

CardTitle.displayName = 'Card.Title';
