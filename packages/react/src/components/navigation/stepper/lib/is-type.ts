import { Children, isValidElement, type ReactNode } from 'react';

import { elementTypeOf } from '../../../../utils';

const partBehindAlias = new WeakMap<object, unknown>();

export const registerPartAlias = (alias: object, part: unknown) => {
  partBehindAlias.set(alias, part);
};

const partOf = (type: unknown) => (typeof type === 'function' && partBehindAlias.get(type)) || type;

export const isType = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && partOf(elementTypeOf(node)) === type;

export function containsPart(children: unknown, part: unknown): boolean {
  if (typeof children === 'function') return false;

  return Children.toArray(children as ReactNode).some(
    (child) =>
      isValidElement<{ children?: ReactNode }>(child) &&
      (partOf(elementTypeOf(child)) === part || containsPart(child.props.children, part)),
  );
}
