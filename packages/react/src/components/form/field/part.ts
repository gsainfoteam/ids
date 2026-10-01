import {
  cloneElement,
  createElement,
  isValidElement,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { invariant, mergeProps } from '../../../utils';

import type { StateValue } from './state-value';

type PartOwnProps<S> = {
  asChild?: boolean;
  className?: StateValue<S, string | undefined>;
  style?: StateValue<S, CSSProperties | undefined>;
  children?: StateValue<S, ReactNode>;
};

export type FieldPartProps<Tag extends 'label' | 'div', S> = Omit<
  ComponentProps<Tag>,
  keyof PartOwnProps<S>
> &
  PartOwnProps<S>;

export function renderPart(
  name: string,
  asChild: boolean | undefined,
  props: Record<string, unknown>,
  content: ReactNode,
) {
  if (asChild) {
    invariant(isValidElement(content), `Field.${name} asChild requires one element.`);
    return cloneElement(content, mergeProps(content.props as Record<string, unknown>, props));
  }
  return createElement('div', props, content);
}
