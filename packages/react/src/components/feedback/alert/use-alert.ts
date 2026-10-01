'use client';

import { useEffect, useLayoutEffect, useState, type KeyboardEvent } from 'react';

import { tabbable } from 'tabbable';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { keyHandler, withModifiers } from '../../../internal/keys';
import { usePresence } from '../../../internal/overlay/use-presence';

function neighbour(root: HTMLElement) {
  const candidates = tabbable(root.ownerDocument.body).filter(
    (element) => !root.contains(element) && !element.closest('[aria-hidden="true"]'),
  );
  const following = candidates.find(
    (element) => root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  return (
    following ??
    [...candidates]
      .reverse()
      .find((element) => root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING)
  );
}

function releaseFocus(root: HTMLElement) {
  if (root.contains(root.ownerDocument.activeElement)) neighbour(root)?.focus();
}

function useReleaseFocusBeforeRemoval(node: HTMLElement | null) {
  useLayoutEffect(() => {
    if (!node) return;
    return () => releaseFocus(node);
  }, [node]);
}

export type UseAlertOptions = {
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  dismissible: boolean;
};

export function useAlert({ open, defaultOpen, onOpenChange, dismissible }: UseAlertOptions) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });

  const { mounted, ending } = usePresence(isOpen, { elements: () => [node] });

  useEffect(() => {
    if (ending && node) releaseFocus(node);
  }, [ending, node]);

  useReleaseFocusBeforeRemoval(node);

  const close = () => {
    if (node) releaseFocus(node);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!dismissible) return;

    keyHandler(
      withModifiers({
        Escape: () => {
          close();
        },
      }),
    )(event);
  };

  return {
    setNode,
    open: isOpen,
    mounted,
    ending,
    close,
    onKeyDown,
  };
}
