'use client';

import { Children, isValidElement } from 'react';

import { itemGroupStyle } from './style';
import { elementTypeOf, mergeRefs } from '../../../utils';
import { ItemGroupContext } from '../item/context';
import { ItemSeparator } from '../item/separator';

import type { ItemGroup } from '.';

const keepListRoleInSafari = { role: 'list' } as const;

export function ItemGroupRoot({
  variant = 'bordered',
  ordered = false,
  size,
  ref,
  className,
  children,
  ...props
}: ItemGroup.Props) {
  const styles = itemGroupStyle({ variant });
  const List = ordered ? 'ol' : 'ul';
  const rowVariant = variant === 'separated' ? 'outline' : undefined;

  return (
    <ItemGroupContext value={{ size, variant: rowVariant }}>
      <List
        {...keepListRoleInSafari}
        {...props}
        ref={mergeRefs(ref)}
        data-item-group=""
        data-variant={variant}
        className={styles.root({ className })}
      >
        {Children.map(children, (child) => {
          if (child == null || typeof child === 'boolean') return child;
          if (
            isValidElement(child) &&
            (child.type === 'li' || elementTypeOf(child) === ItemSeparator)
          )
            return child;
          return <li className={styles.item()}>{child}</li>;
        })}
      </List>
    </ItemGroupContext>
  );
}
