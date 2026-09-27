import { Children, isValidElement, useLayoutEffect, type ReactNode, type RefObject } from 'react';

import { useIconLabel } from '../../../internal/icon-label';
import { isDevelopment } from '../../../utils/dev';
import { useButton } from '../button/use-button';

export type FloatingPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type Hideable = { 'aria-hidden'?: unknown; children?: ReactNode };

// Visible text makes the button extended. An svg or anything aria-hidden is decoration.
export function visibleText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      if (!isValidElement<Hideable>(child)) return '';
      const hidden = child.props['aria-hidden'];
      if (child.type === 'svg' || hidden === true || hidden === 'true') return '';
      return visibleText(child.props.children);
    })
    .join('')
    .trim();
}

const mounted = new WeakMap<Document, Set<{ node: HTMLElement; placement: FloatingPlacement }>>();

const overlaps = (a: DOMRect, b: DOMRect) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

// Two buttons at one placement cover each other, unless each sits in its own containing block (a
// transformed ancestor), so the check compares where they actually landed.
function usePlacementCheck(nodeRef: RefObject<HTMLElement | null>, placement: FloatingPlacement) {
  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!isDevelopment || !node || node.hidden) return;
    let entries = mounted.get(node.ownerDocument);
    if (!entries) mounted.set(node.ownerDocument, (entries = new Set()));
    const rect = node.getBoundingClientRect();
    for (const other of entries)
      if (other.placement === placement && overlaps(rect, other.node.getBoundingClientRect()))
        console.warn(
          `[IDS] FloatingButton: two buttons at placement "${placement}" cover each other. Give one another placement, or render one at a time.`,
        );
    const entry = { node, placement };
    entries.add(entry);
    return () => {
      entries.delete(entry);
    };
  }, [nodeRef, placement]);
}

type FloatingOwnProps = {
  placement?: FloatingPlacement;
  // For content whose text cannot be read from its elements (a translation component).
  iconOnly?: boolean;
};

export function useFloatingButton<P extends object>(props: P) {
  const button = useButton(props, 'FloatingButton');
  const {
    placement = 'bottom-right',
    iconOnly: iconOnlyProp,
    ...rest
  } = button.props as typeof button.props & FloatingOwnProps & { 'aria-label'?: string };
  const iconOnly = iconOnlyProp ?? visibleText(button.content) === '';
  const label = useIconLabel(
    'FloatingButton',
    iconOnly ? button.content : undefined,
    rest,
    button.element?.props as object | undefined,
  );
  usePlacementCheck(button.nodeRef, placement);

  return { ...button, props: rest, placement, iconOnly, label };
}
