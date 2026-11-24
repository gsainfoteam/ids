'use client';

import { useCallback, type Ref, type RefCallback } from 'react';

import { mergeRefs } from '../../../../utils';

export function useInternalDrawerMergedRef<T extends HTMLElement>(
  ref: Ref<T> | undefined,
  setNode: (node: HTMLElement | null) => void,
): RefCallback<HTMLElement> {
  return useCallback(
    (node: HTMLElement | null) => mergeRefs(ref, setNode)(node as T | null),
    [ref, setNode],
  );
}
