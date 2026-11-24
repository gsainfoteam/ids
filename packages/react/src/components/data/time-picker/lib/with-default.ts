import { cloneElement, isValidElement, type ReactNode } from 'react';

export function withDefault(children: ReactNode, fallback: ReactNode) {
  return isValidElement<{ children?: ReactNode }>(children) && children.props.children == null
    ? cloneElement(children, undefined, fallback)
    : children;
}
