'use client';

import { createElement, type MouseEvent, type ReactNode } from 'react';

import { useInternalPaginationContext } from '../context';
import { opensElsewhere, withFallbackContent } from '../lib/control';

type ControlOptions = {
  part: string;
  target: number;
  asChild: boolean | undefined;
  disabled: boolean | undefined;
  children: ReactNode;
  fallback: ReactNode;
  onClick: ((event: MouseEvent<HTMLElement>) => void) | undefined;
};

export function useInternalPaginationControl({
  part,
  target,
  asChild = false,
  disabled,
  children,
  fallback,
  onClick,
}: ControlOptions) {
  const context = useInternalPaginationContext(part);
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
    content: rendersOwnAnchor ? createElement('a', { href }, content) : content,
  };
}
