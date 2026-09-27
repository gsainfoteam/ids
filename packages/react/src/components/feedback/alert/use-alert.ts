import { useEffect, useLayoutEffect, useState, type KeyboardEvent } from 'react';

import { tabbable } from 'tabbable';

import { useControllableState } from '../../../hooks/use-controllable-state';

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

function animationsOf(element: HTMLElement) {
  return typeof element.getAnimations === 'function' ? element.getAnimations() : [];
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

  const [lastOpen, setLastOpen] = useState(isOpen);
  const [ending, setEnding] = useState(false);
  if (lastOpen !== isOpen) {
    setLastOpen(isOpen);
    setEnding(!isOpen);
  }

  useEffect(() => {
    if (!ending || !node) return;
    releaseFocus(node);
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      Promise.allSettled(animationsOf(node).map((animation) => animation.finished)).then(() => {
        if (!cancelled) setEnding(false);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [ending, node]);

  useLayoutEffect(() => {
    if (!node) return;
    return () => releaseFocus(node);
  }, [node]);

  const close = () => {
    if (node) releaseFocus(node);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const composing = event.nativeEvent.isComposing || event.keyCode === 229;
    if (!dismissible || event.key !== 'Escape' || event.defaultPrevented || composing) return;
    event.preventDefault();
    close();
  };

  return {
    setNode,
    open: isOpen,
    mounted: isOpen || ending,
    ending,
    close,
    onKeyDown,
  };
}
