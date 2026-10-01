'use client';

import { useItemContext } from './context';
import { Part, type ItemPartProps } from './part';
import { useRegisteredId } from '../../../internal/surface';
import { titleContent } from '../../../internal/surface-trigger';
import { cn } from '../../../utils';

export type ItemTitleProps = ItemPartProps & { truncate?: boolean };

export function ItemTitle({
  truncate = false,
  className,
  id,
  asChild,
  children,
  ...props
}: ItemTitleProps) {
  const { styles, trigger, setTitleId } = useItemContext('Item.Title');
  const titleId = useRegisteredId(setTitleId, id);
  return (
    <Part
      {...props}
      asChild={asChild}
      id={titleId}
      kind="title"
      className={styles.title({ truncate, className })}
    >
      {titleContent({
        trigger,
        asChild,
        children,
        triggerClassName: truncate ? cn('block truncate') : undefined,
      })}
    </Part>
  );
}

ItemTitle.displayName = 'Item.Title';
