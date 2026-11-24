'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type KeyboardEvent,
  type Ref,
  type RefCallback,
} from 'react';

import { tabbable } from 'tabbable';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import { keyHandler, withModifiers } from '../../../../internal/lib/keys';
import { useInternalPresence } from '../../../../internal/overlay/hooks/use-presence';
import { mergeRefs } from '../../../../utils';

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

function useInternalReleaseFocusBeforeRemoval(node: HTMLElement | null) {
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
  ref: Ref<HTMLDivElement> | undefined;
};

export function useInternalAlert({
  open,
  defaultOpen,
  onOpenChange,
  dismissible,
  ref,
}: UseAlertOptions) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });

  const { mounted, ending } = useInternalPresence(isOpen, { elements: () => [node] });

  useEffect(() => {
    if (ending && node) releaseFocus(node);
  }, [ending, node]);

  useInternalReleaseFocusBeforeRemoval(node);

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

  const mergedRef: RefCallback<HTMLDivElement> = useCallback(
    (element: HTMLDivElement | null) => mergeRefs(setNode, ref)(element),
    [setNode, ref],
  );

  return {
    ref: mergedRef,
    open: isOpen,
    mounted,
    ending,
    close,
    onKeyDown,
  };
}
