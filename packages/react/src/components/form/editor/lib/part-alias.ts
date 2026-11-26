import { Children, isValidElement, type ReactNode } from 'react';

import { elementTypeOf } from '../../../../utils';

const partBehindAlias = new WeakMap<object, unknown>();

export const registerEditorPartAlias = (alias: object, part: unknown) => {
  partBehindAlias.set(alias, part);
};

export const editorPartOf = (node: ReactNode) => {
  if (!isValidElement(node)) return undefined;
  const type = elementTypeOf(node);
  return (typeof type === 'function' && partBehindAlias.get(type)) || type;
};

export const isEditorPart = (part: unknown) => (node: ReactNode) => editorPartOf(node) === part;

export function containsEditorPart(children: unknown, parts: ReadonlySet<unknown>): boolean {
  if (typeof children === 'function') return false;

  return Children.toArray(children as ReactNode).some(
    (child) =>
      isValidElement<{ children?: ReactNode }>(child) &&
      (parts.has(editorPartOf(child)) || containsEditorPart(child.props.children, parts)),
  );
}
