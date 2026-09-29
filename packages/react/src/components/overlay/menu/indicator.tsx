'use client';

import { cloneElement, isValidElement, use, type ComponentProps, type ReactNode } from 'react';

import { CheckIcon } from '@heroicons/react/16/solid';

import { ItemContext } from './context';
import { menuStyle } from './style';
import { flattenFragments, invariant, mergeProps, part } from '../../../utils';

export type MenuItemIndicatorProps = ComponentProps<'span'> & { asChild?: boolean };

export function MenuItemIndicator({
  asChild,
  children,
  className,
  ...props
}: MenuItemIndicatorProps) {
  const item = use(ItemContext);
  invariant(
    item,
    'Menu.ItemIndicator must be rendered inside Menu.CheckboxItem or Menu.RadioItem.',
  );

  if (!item.checked) return null;

  const styles = menuStyle();
  const glyph = item.kind === 'radio' ? <span className={styles.dot()} /> : <CheckIcon />;

  return part(
    'span',
    asChild,
    children ?? glyph,
    mergeProps(props, {
      'aria-hidden': true,
      'data-menu-item-indicator': '',
      className: styles.indicator({ className }),
    }),
  );
}

MenuItemIndicator.displayName = 'Menu.ItemIndicator';

const isIndicator = (node: ReactNode) => isValidElement(node) && node.type === MenuItemIndicator;

export function withIndicator(children: ReactNode, asChild: boolean | undefined) {
  const append = (nodes: ReactNode) => (
    <>
      {nodes}
      {!flattenFragments(nodes).some(isIndicator) && <MenuItemIndicator />}
    </>
  );

  if (asChild && isValidElement<{ children?: ReactNode }>(children))
    return cloneElement(children, {}, append(children.props.children));
  return append(children);
}
