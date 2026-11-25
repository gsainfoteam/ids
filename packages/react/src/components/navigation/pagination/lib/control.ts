import { cloneElement, isValidElement, type MouseEvent, type ReactNode } from 'react';

export const opensElsewhere = (event: MouseEvent<HTMLElement>) =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

export function withFallbackContent(asChild: boolean, children: ReactNode, fallback: ReactNode) {
  if (!asChild) return children ?? fallback;
  if (isValidElement<{ children?: ReactNode }>(children) && children.props.children == null)
    return cloneElement(children, undefined, fallback);
  return children;
}
