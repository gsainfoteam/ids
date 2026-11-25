'use client';

import { type ComponentProps } from 'react';

import { useInternalParagraphRef } from '../../../../internal/hooks/use-paragraph-ref';
import { useInternalRegisteredId } from '../../../../internal/hooks/use-registered-id';
import { Slot } from '../../../utility/slot';
import { useInternalItemContext } from '../context';

export type ItemDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function ItemDescription({ asChild, className, id, ref, ...props }: ItemDescriptionProps) {
  const { styles, setDescriptionId } = useInternalItemContext('Item.Description');
  const descriptionId = useInternalRegisteredId(setDescriptionId, id);
  const paragraphRef = useInternalParagraphRef('Item.Description', ref);
  const Root = asChild === true ? Slot : 'p';
  return (
    <Root
      {...props}
      ref={paragraphRef}
      id={descriptionId}
      data-item-description=""
      className={styles.description({ className })}
    />
  );
}

ItemDescription.displayName = 'Item.Description';
