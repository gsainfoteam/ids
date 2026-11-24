'use client';

import { type ComponentProps } from 'react';

import { useInternalRegisteredId } from '../../../../internal/lib/surface';
import { titleContent } from '../../../../internal/parts/surface-trigger';
import { Slot } from '../../../utility/slot';
import { useInternalCardContext } from '../context';

export type CardTitleProps = ComponentProps<'h3'> & { asChild?: boolean };

export function CardTitle({ className, id, asChild, children, ...props }: CardTitleProps) {
  const { styles, trigger, setTitleId } = useInternalCardContext('Card.Title');
  const titleId = useInternalRegisteredId(setTitleId, id);
  const Heading = asChild ? Slot : 'h3';

  return (
    <Heading {...props} id={titleId} data-card-title="" className={styles.title({ className })}>
      {titleContent({ trigger, asChild, children })}
    </Heading>
  );
}

CardTitle.displayName = 'Card.Title';
