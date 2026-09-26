import { Children, cloneElement, Fragment, isValidElement, type ReactNode } from 'react';

// Fragments are transparent; arbitrary components are never executed to find a sentinel.
// Keys are prefixed with the Fragment path so siblings from different Fragments stay unique.
export function flattenFragments(children: ReactNode, prefix = ''): ReactNode[] {
  return Children.toArray(children).flatMap((child, index) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenFragments(child.props.children, `${prefix}${index}:`)
      : [isValidElement(child) ? cloneElement(child, { key: `${prefix}${child.key}` }) : child],
  );
}
