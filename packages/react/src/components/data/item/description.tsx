'use client';

import { type ComponentProps } from 'react';

import { useItemContext } from './context';
import { useParagraphRef } from '../../../internal/paragraph';
import { useRegisteredId } from '../../../internal/surface';
import { Slot } from '../../utility/slot';

export type ItemDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function ItemDescription({ asChild, className, id, ref, ...props }: ItemDescriptionProps) {
  const { styles, setDescriptionId } = useItemContext('Item.Description');
  const descriptionId = useRegisteredId(setDescriptionId, id);
  const paragraphRef = useParagraphRef('Item.Description', ref);
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
