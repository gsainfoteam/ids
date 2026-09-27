import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

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

// Focus inside a closing alert would fall back to the body, and the next Tab would start from the
// top of the page. It moves to what comes after the alert instead, or before it at the end.
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
  const rootRef = useRef<HTMLDivElement>(null);
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
    const root = rootRef.current;
    if (!ending || !root) return;
    let cancelled = false;
    // The frame lets the ending style apply, so the transitions it starts can be awaited.
    const frame = requestAnimationFrame(() => {
      Promise.allSettled(animationsOf(root).map((animation) => animation.finished)).then(() => {
        if (!cancelled) setEnding(false);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [ending]);

  const close = () => {
    const root = rootRef.current;
    if (root?.contains(root.ownerDocument.activeElement)) neighbour(root)?.focus();
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
    rootRef,
    open: isOpen,
    mounted: isOpen || ending,
    ending,
    close,
    onKeyDown,
  };
}
