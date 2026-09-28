import { Children, cloneElement, Fragment, isValidElement, type ReactNode } from 'react';

export function flattenFragments(children: ReactNode, fragmentPath = ''): ReactNode[] {
  return Children.toArray(children).flatMap((child, index) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenFragments(child.props.children, `${fragmentPath}${index}:`)
      : [
          isValidElement(child)
            ? cloneElement(child, { key: `${fragmentPath}${child.key}` })
            : child,
        ],
  );
}
