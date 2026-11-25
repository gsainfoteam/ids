'use client';

import { useCallback, useLayoutEffect, useState, type Ref, type RefCallback } from 'react';

import { mergeRefs } from '../../../../utils';

export function useInternalImageGroupDocumentOrder(
  followTheDocumentOrder: () => void,
  ref: Ref<HTMLUListElement> | undefined,
) {
  const [list, setList] = useState<HTMLUListElement | null>(null);
  const attachList: RefCallback<HTMLUListElement> = useCallback(
    (node: HTMLUListElement | null) => mergeRefs(setList, ref)(node),
    [ref],
  );

  useLayoutEffect(() => {
    if (!list) return;

    const observer = new MutationObserver(followTheDocumentOrder);
    observer.observe(list, { childList: true });

    return () => observer.disconnect();
  }, [list, followTheDocumentOrder]);

  return attachList;
}
