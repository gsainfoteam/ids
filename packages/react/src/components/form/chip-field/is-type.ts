import { isValidElement, type ReactNode } from 'react';

import { elementTypeOf } from '../../../utils';

export const isType = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === type;
