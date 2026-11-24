import { isValidElement, type ReactNode } from 'react';

import { elementTypeOf } from '../../../../utils';

const partBehindAlias = new WeakMap<object, unknown>();

export const registerPartAlias = (alias: object, part: unknown) => {
  partBehindAlias.set(alias, part);
};

const partOf = (type: unknown) => (typeof type === 'function' && partBehindAlias.get(type)) || type;

export const isType = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && partOf(elementTypeOf(node)) === type;
