'use client';

import { type ComponentProps } from 'react';

import { useCardContext } from './context';
import { useParagraphRef } from '../../../internal/paragraph';
import { useRegisteredId } from '../../../internal/surface';
import { Slot } from '../../utility/slot';

export type CardDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function CardDescription({ asChild, className, id, ref, ...props }: CardDescriptionProps) {
  const { styles, setDescriptionId } = useCardContext('Card.Description');
  const descriptionId = useRegisteredId(setDescriptionId, id);
  const paragraphRef = useParagraphRef('Card.Description', ref);
  const Root = asChild === true ? Slot : 'p';
  return (
    <Root
      {...props}
      ref={paragraphRef}
      id={descriptionId}
      data-card-description=""
      className={styles.description({ className })}
    />
  );
}

CardDescription.displayName = 'Card.Description';
