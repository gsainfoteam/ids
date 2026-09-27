import { useEffect, useLayoutEffect, useState, type KeyboardEvent } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';

const TABBABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

function neighbour(root: HTMLElement) {
  const candidates = [...root.ownerDocument.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (element) =>
      !root.contains(element) && !element.closest('[hidden], [inert], [aria-hidden="true"]'),
  );
  const following = candidates.find(
    (element) => root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  return (
    following ??
    candidates
      .reverse()
      .find((element) => root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING)
  );
}

// Focus inside a closing alert would fall back to the body, and the next Tab would start from the
// top of the page. It moves to what comes after the alert instead, or before it at the end.
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

  // A closed alert stays mounted until its exit transition ends, whether it was closed from
  // inside or by the parent flipping `open`.
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
    // The frame lets the ending style apply, so the transitions it starts can be awaited.
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

  // A parent may drop the alert outright, say from an action inside it. Layout cleanup runs while
  // the element is still in the document, so focus can still be handed on.
  useLayoutEffect(() => {
    if (!node) return;
    return () => releaseFocus(node);
  }, [node]);

  const close = () => {
    if (node) releaseFocus(node);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Escape during IME composition cancels the composition, not the alert.
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
