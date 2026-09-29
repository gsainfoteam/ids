'use client';

import { Children, isValidElement, type ComponentProps, type Ref } from 'react';

import { ItemGroupContext } from './context';
import { ItemSeparator } from './separator';
import { itemStyle } from './style';
import { elementTypeOf, mergeRefs } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type ItemGroupVariant = 'bordered' | 'separated' | 'ghost';

const keepListRoleInSafari = { role: 'list' } as const;

export type ItemGroupProps = Omit<ComponentProps<'ul'>, 'ref'> & {
  ref?: Ref<HTMLElement>;
  variant?: ItemGroupVariant;
  ordered?: boolean;
  size?: IdsSize;
  dense?: boolean;
};

export function ItemGroup({
  variant = 'ghost',
  ordered = false,
  size,
  dense,
  ref,
  className,
  children,
  ...props
}: ItemGroupProps) {
  const styles = itemStyle({ groupVariant: variant });
  const List = ordered ? 'ol' : 'ul';
  const rowVariant = variant === 'separated' ? 'outline' : undefined;

  return (
    <ItemGroupContext value={{ size, dense, variant: rowVariant }}>
      <List
        {...keepListRoleInSafari}
        {...props}
        ref={mergeRefs(ref)}
        data-item-group=""
        data-variant={variant}
        className={styles.group({ className })}
      >
        {Children.map(children, (child) => {
          if (child == null || typeof child === 'boolean') return child;
          if (
            isValidElement(child) &&
            (child.type === 'li' || elementTypeOf(child) === ItemSeparator)
          )
            return child;
          return <li className={styles.groupItem()}>{child}</li>;
        })}
      </List>
    </ItemGroupContext>
  );
}

ItemGroup.displayName = 'Item.Group';
