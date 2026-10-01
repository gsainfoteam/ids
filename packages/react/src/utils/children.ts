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

const LAZY_TYPE = Symbol.for('react.lazy');

type LazyType = { $$typeof: symbol; _payload: unknown; _init: (payload: unknown) => unknown };

const isLazyType = (type: unknown): type is LazyType =>
  typeof type === 'object' &&
  type !== null &&
  (type as { $$typeof?: unknown }).$$typeof === LAZY_TYPE;

export function elementTypeOf(element: { type: unknown }): unknown {
  let type = element.type;
  while (isLazyType(type)) type = type._init(type._payload);
  return type;
}

export function containsElementOfType(children: unknown, types: ReadonlySet<unknown>): boolean {
  if (typeof children === 'function') return false;

  return Children.toArray(children as ReactNode).some(
    (child) =>
      isValidElement<{ children?: ReactNode }>(child) &&
      (types.has(elementTypeOf(child)) || containsElementOfType(child.props.children, types)),
  );
}
