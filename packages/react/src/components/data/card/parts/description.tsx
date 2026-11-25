'use client';

import { type ComponentProps } from 'react';

import { useInternalParagraphRef } from '../../../../internal/hooks/use-paragraph-ref';
import { useInternalRegisteredId } from '../../../../internal/hooks/use-registered-id';
import { Slot } from '../../../utility/slot';
import { useInternalCardContext } from '../context';

export type CardDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function CardDescription({ asChild, className, id, ref, ...props }: CardDescriptionProps) {
  const { styles, setDescriptionId } = useInternalCardContext('Card.Description');
  const descriptionId = useInternalRegisteredId(setDescriptionId, id);
  const paragraphRef = useInternalParagraphRef('Card.Description', ref);
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
