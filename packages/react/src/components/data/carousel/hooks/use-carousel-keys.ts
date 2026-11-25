'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type Ref,
  type RefCallback,
} from 'react';

import { moveWithKeys, type Slides } from '../../../../internal/slides';
import { mergeRefs } from '../../../../utils';

type KeysOptions = {
  slides: Slides;
  ref: Ref<HTMLElement> | undefined;
  onKeyDown: ((event: KeyboardEvent<HTMLElement>) => void) | undefined;
};

export function useInternalCarouselKeys({ slides, ref, onKeyDown }: KeysOptions) {
  const rootRef = useRef<HTMLElement>(null);
  const focusIndicatorAfterMove = useRef(false);
  const mergedRef: RefCallback<HTMLElement> = useCallback(
    (node: HTMLElement | null) => mergeRefs(rootRef, ref)(node),
    [ref],
  );

  useEffect(() => {
    if (!focusIndicatorAfterMove.current) return;
    focusIndicatorAfterMove.current = false;

    const root = rootRef.current;
    const indicators = root?.querySelectorAll<HTMLElement>(
      '[data-carousel-indicator][data-current]',
    );
    [...(indicators ?? [])]
      .find((indicator) => indicator.closest('[data-carousel]') === root)
      ?.focus();
  }, [slides.selected]);

  const moveOnKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const fromIndicator = Boolean((event.target as Element).closest('[data-carousel-indicator]'));
    if (moveWithKeys(slides, event)) focusIndicatorAfterMove.current = fromIndicator;
  };

  return { mergedRef, moveOnKeyDown };
}
