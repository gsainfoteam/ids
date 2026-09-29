import { isValidElement, type ReactNode } from 'react';

export const isType = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && node.type === type;
