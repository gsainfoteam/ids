import { Fragment, cloneElement, createElement, isValidElement, type ReactNode } from 'react';

import { invariant, mergeProps } from '../../utils';

export function part(
  tag: 'button' | 'span' | 'div' | 'input',
  asChild: boolean | undefined,
  children: ReactNode,
  props: Record<string, unknown>,
) {
  if (asChild) {
    invariant(
      isValidElement<Record<string, unknown>>(children) && children.type !== Fragment,
      'IDS: asChild requires one element forwarding props/ref.',
    );
    invariant(
      typeof children.type !== 'string' || tag === 'span' || tag === 'div' || children.type === tag,
      `IDS: asChild must render a ${tag}.`,
    );
    return cloneElement(children, mergeProps(children.props, props));
  }
  return createElement(tag, props, tag === 'input' ? undefined : children);
}
