'use client';

import { useCallback, useRef, useState, type Ref, type RefCallback } from 'react';

import { mergeRefs } from '../../../../utils';

export function useInternalIdsProviderElement(ref: Ref<HTMLDivElement> | undefined) {
  const elementRef = useRef<HTMLElement>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const mergedRef: RefCallback<HTMLElement> = useCallback(
    (node: HTMLElement | null) => mergeRefs(elementRef, setElement, ref)(node),
    [ref],
  );

  return { elementRef, element, mergedRef };
}
