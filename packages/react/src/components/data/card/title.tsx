'use client';

import { type ComponentProps } from 'react';

import { useCardContext } from './context';
import { useRegisteredId } from '../../../internal/surface';
import { titleContent } from '../../../internal/surface-trigger';
import { Slot } from '../../utility/slot';

export type CardTitleProps = ComponentProps<'h3'> & { asChild?: boolean };

export function CardTitle({ className, id, asChild, children, ...props }: CardTitleProps) {
  const { headingLevel, styles, trigger, setTitleId } = useCardContext('Card.Title');
  const titleId = useRegisteredId(setTitleId, id);
  const Heading = asChild ? Slot : (`h${headingLevel}` as const);

  return (
    <Heading {...props} id={titleId} data-card-title="" className={styles.title({ className })}>
      {titleContent({ trigger, asChild, children })}
    </Heading>
  );
}

CardTitle.displayName = 'Card.Title';
