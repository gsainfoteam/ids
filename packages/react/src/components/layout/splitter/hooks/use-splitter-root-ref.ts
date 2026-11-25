'use client';

import { useCallback, type Ref, type RefCallback, type RefObject } from 'react';

import { mergeRefs } from '../../../../utils';

export function useInternalSplitterRootRef(
  rootRef: RefObject<HTMLDivElement | null>,
  ref: Ref<HTMLDivElement> | undefined,
): RefCallback<HTMLDivElement> {
  return useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [rootRef, ref],
  );
}
