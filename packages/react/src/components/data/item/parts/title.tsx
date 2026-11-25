'use client';

import { useInternalItemContext } from '../context';
import { Part, type ItemPartProps } from './part';
import { useInternalRegisteredId } from '../../../../internal/hooks/use-registered-id';
import { titleContent } from '../../../../internal/parts/surface-trigger';
import { cn } from '../../../../utils';

export type ItemTitleProps = ItemPartProps & { truncate?: boolean };

export function ItemTitle({
  truncate = false,
  className,
  id,
  asChild,
  children,
  ...props
}: ItemTitleProps) {
  const { styles, trigger, setTitleId } = useInternalItemContext('Item.Title');
  const titleId = useInternalRegisteredId(setTitleId, id);
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
