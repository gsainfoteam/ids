'use client';

import { useItemContext } from './context';
import { Part, type ItemPartProps } from './part';
import { useRegisteredId } from '../../../internal/surface';

export type ItemDescriptionProps = ItemPartProps;

export function ItemDescription({ className, id, ...props }: ItemDescriptionProps) {
  const { styles, setDescriptionId } = useItemContext('Item.Description');
  const descriptionId = useRegisteredId(setDescriptionId, id);
  return (
    <Part
      {...props}
      id={descriptionId}
      kind="description"
      className={styles.description({ className })}
    />
  );
}

ItemDescription.displayName = 'Item.Description';
