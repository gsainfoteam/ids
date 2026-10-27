'use client';

import { type ComponentProps } from 'react';

import { useItemContext } from './context';
import { useRegisteredId } from '../../../internal/surface';
import { titleContent } from '../../../internal/surface-trigger';
import { cn } from '../../../utils';
import { Slot } from '../../utility/slot';

export type ItemTitleProps = ComponentProps<'h3'> & { asChild?: boolean; truncate?: boolean };

export function ItemTitle({
  truncate = false,
  className,
  id,
  asChild,
  children,
  ...props
}: ItemTitleProps) {
  const { headingLevel, styles, trigger, setTitleId } = useItemContext('Item.Title');
  const titleId = useRegisteredId(setTitleId, id);
  const Title = asChild ? Slot : headingLevel ? (`h${headingLevel}` as const) : 'div';

  return (
    <Title
      {...props}
      id={titleId}
      data-item-title=""
      className={styles.title({ truncate, className })}
    >
      {titleContent({
        trigger,
        asChild,
        children,
        triggerClassName: truncate ? cn('block truncate') : undefined,
      })}
    </Title>
  );
}

ItemTitle.displayName = 'Item.Title';
