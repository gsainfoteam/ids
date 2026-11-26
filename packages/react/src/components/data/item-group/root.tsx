'use client';

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

import { itemGroupStyle } from './style';
import { elementTypeOf, mergeRefs } from '../../../utils';
import { Slot } from '../../utility/slot';
import { ItemGroupContext } from '../item/context';
import { ItemSeparator } from '../item/parts/separator';

import type { ItemGroup } from '.';

const keepListRoleInSafari = { role: 'list' } as const;

function listOf(asChild: boolean, children: ReactNode) {
  if (asChild && isValidElement<{ children?: ReactNode }>(children)) return children;
  return null;
}

export function ItemGroupRoot({
  variant = 'bordered',
  size,
  asChild = false,
  ref,
  className,
  children,
  ...props
}: ItemGroup.Props) {
  const styles = itemGroupStyle({ variant });
  const rowVariant = variant === 'separated' ? 'outline' : undefined;
  const list: ReactElement<{ children?: ReactNode }> | null = listOf(asChild, children);
  const Root = list ? Slot : 'ul';

  const rows = Children.map(list ? list.props.children : children, (child) => {
    if (child == null || typeof child === 'boolean') return child;
    if (isValidElement(child) && (child.type === 'li' || elementTypeOf(child) === ItemSeparator))
      return child;
    return <li className={styles.item()}>{child}</li>;
  });

  return (
    <ItemGroupContext value={{ size, variant: rowVariant }}>
      <Root
        {...keepListRoleInSafari}
        {...props}
        ref={mergeRefs(ref)}
        data-item-group=""
        data-variant={variant}
        className={styles.root({ className })}
      >
        {list ? cloneElement(list, undefined, rows) : rows}
      </Root>
    </ItemGroupContext>
  );
}
