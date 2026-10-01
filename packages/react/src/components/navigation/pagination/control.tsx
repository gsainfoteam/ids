'use client';

import { cloneElement, isValidElement, type MouseEvent, type ReactNode } from 'react';

import { usePaginationContext } from './context';

type ControlOptions = {
  part: string;
  target: number;
  asChild: boolean | undefined;
  disabled: boolean | undefined;
  children: ReactNode;
  fallback: ReactNode;
  onClick: ((event: MouseEvent<HTMLElement>) => void) | undefined;
};

const opensElsewhere = (event: MouseEvent<HTMLElement>) =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

function withFallbackContent(asChild: boolean, children: ReactNode, fallback: ReactNode) {
  if (!asChild) return children ?? fallback;
  if (isValidElement<{ children?: ReactNode }>(children) && children.props.children == null)
    return cloneElement(children, undefined, fallback);
  return children;
}

export function usePaginationControl({
  part,
  target,
  asChild = false,
  disabled,
  children,
  fallback,
  onClick,
}: ControlOptions) {
  const context = usePaginationContext(part);
  const href = context.getHref?.(target);
  const navigates = asChild || href !== undefined;
  const content = withFallbackContent(asChild, children, fallback);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (navigates && opensElsewhere(event)) return;
    context.setPage(target);
  };

  const rendersOwnAnchor = !asChild && href !== undefined;

  return {
    context,
    control: {
      asChild: asChild || rendersOwnAnchor,
      href: asChild ? href : undefined,
      disabled: disabled || context.disabled,
      onClick: handleClick,
      size: context.size,
      'data-pagination-control': '',
      'data-page': target,
    },
    content: rendersOwnAnchor ? <a href={href}>{content}</a> : content,
  };
}
