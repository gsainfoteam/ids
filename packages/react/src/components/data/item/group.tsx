'use client';

import { Children, isValidElement, type ComponentProps } from 'react';

import { ItemGroupContext } from './context';
import { ItemSeparator } from './separator';
import { itemStyle } from './style';
import { elementTypeOf } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

const keepListRoleInSafari = { role: 'list' } as const;

export type ItemGroupProps = ComponentProps<'ul'> & { size?: IdsSize; dense?: boolean };

export function ItemGroup({ size, dense, className, children, ...props }: ItemGroupProps) {
  const styles = itemStyle();
  return (
    <ItemGroupContext value={{ size, dense }}>
      <ul
        {...keepListRoleInSafari}
        {...props}
        data-item-group=""
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
      </ul>
    </ItemGroupContext>
  );
}

ItemGroup.displayName = 'Item.Group';
