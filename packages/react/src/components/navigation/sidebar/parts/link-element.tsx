'use client';

import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

import { mergeProps } from '../../../../utils';

import type { SidebarLinkProps } from '../lib/item-children';

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
