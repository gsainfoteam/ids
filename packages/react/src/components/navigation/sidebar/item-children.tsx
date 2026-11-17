'use client';

import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

import { elementTypeOf, flattenFragments, invariant, mergeProps } from '../../../utils';

export type SidebarLinkProps = {
  href?: string;
  asChild?: boolean;
  children?: ReactNode;
};

export type ItemParts<P> = {
  icon: ReactNode;
  label: ReactNode[];
  end: ReactNode[];
  subItems: ReactElement<P>[];
};

const isText = (node: ReactNode) => typeof node === 'string' || typeof node === 'number';

export function splitItemChildren<P>(children: ReactNode, itemType: unknown): ItemParts<P> {
  const parts: ItemParts<P> = { icon: undefined, label: [], end: [], subItems: [] };

  for (const node of flattenFragments(children)) {
    if (isValidElement<P>(node) && elementTypeOf(node) === itemType) parts.subItems.push(node);
    else if (isText(node)) parts.label.push(node);
    else if (parts.icon === undefined && parts.label.length === 0) parts.icon = node;
    else if (parts.label.length === 0) parts.label.push(node);
    else parts.end.push(node);
  }

  return parts;
}

export function linkChildrenOf({ asChild, children }: SidebarLinkProps): ReactNode {
  if (!asChild) return children;
  invariant(
    isValidElement(children),
    '`<Sidebar.Item asChild>` needs one link element as its child.',
  );
  return (children as ReactElement<{ children?: ReactNode }>).props.children;
}

export function linkElementOf(
  { href, asChild, children }: SidebarLinkProps,
  props: Record<string, unknown>,
  content: ReactNode,
): ReactElement {
  if (asChild && isValidElement<Record<string, unknown>>(children))
    return cloneElement(children, mergeProps(children.props, props), content);
  if (href !== undefined)
    return (
      <a {...props} href={href}>
        {content}
      </a>
    );
  return (
    <button type="button" {...props}>
      {content}
    </button>
  );
}

export function containsValue(subItems: ReactElement[], value: string | undefined): boolean {
  if (value === undefined) return false;
  return subItems.some((item) => {
    const props = item.props as { value?: string; children?: ReactNode };
    if (props.value === value) return true;
    const nested = flattenFragments(props.children).filter(
      (node): node is ReactElement =>
        isValidElement(node) && elementTypeOf(node) === elementTypeOf(item),
    );
    return containsValue(nested, value);
  });
}
