'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

import { focusReturnTarget, returnFocusTo, type Layer } from '../../../../internal/overlay';
import { enterFrom, exitTo } from '../lib/flip';

import type { ImageViewerSource } from '../parts/viewer';

type TransitionOptions = {
  source: ImageViewerSource;
  content: HTMLElement | null;
  boxRef: RefObject<HTMLElement | null>;
  selected: number;
  layer: Layer;
};

export function useInternalImageViewerTransition({
  source,
  content,
  boxRef,
  selected,
  layer,
}: TransitionOptions) {
  const { open } = source;

  useLayoutEffect(() => {
    if (open && content) content.focus({ preventScroll: true });
  }, [open, content]);

  const entered = useRef(false);
  useLayoutEffect(() => {
    if (entered.current || !open) return;
    entered.current = true;
    if (boxRef.current) enterFrom(boxRef.current, source.thumbnailOf(selected));
  });

  const wasOpen = useRef(open);
  useLayoutEffect(() => {
    const closing = wasOpen.current && !open;
    wasOpen.current = open;
    if (!closing) return;

    if (boxRef.current) exitTo(boxRef.current, source.thumbnailOf(selected));

    const focused = content?.ownerDocument.activeElement;
    const focusWasInside =
      !focused || focused === content?.ownerDocument.body || !!content?.contains(focused);
    if (focusWasInside) returnFocusTo(focusReturnTarget(layer));
  });
}
