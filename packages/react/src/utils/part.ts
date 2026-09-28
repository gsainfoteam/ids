import { Fragment, cloneElement, createElement, isValidElement, type ReactNode } from 'react';

import { invariant } from './invariant';
import { mergeProps } from './merge';

export function part(
  tag: 'button' | 'span' | 'div' | 'input',
  asChild: boolean | undefined,
  children: ReactNode,
  props: Record<string, unknown>,
) {
  if (asChild) {
    invariant(
      isValidElement<Record<string, unknown>>(children) && children.type !== Fragment,
      'asChild requires one element forwarding props/ref.',
    );
    invariant(
      typeof children.type !== 'string' || tag === 'span' || tag === 'div' || children.type === tag,
      `asChild must render a ${tag}.`,
    );
    return cloneElement(children, mergeProps(children.props, props));
  }
  return createElement(tag, props, tag === 'input' ? undefined : children);
}
