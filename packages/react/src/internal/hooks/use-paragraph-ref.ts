'use client';

import { useCallback, useEffect, useRef, type Ref, type RefCallback } from 'react';

import { mergeRefs } from '../../utils';
import { isDevelopment } from '../../utils/dev';
import { blockInsideParagraph } from '../lib/paragraph';

export function useInternalParagraphRef<T extends HTMLElement>(
  part: string,
  ref: Ref<T> | undefined,
): RefCallback<T> {
  const node = useRef<T | null>(null);
  const warned = useRef(false);

  useEffect(() => {
    if (!isDevelopment || warned.current) return;
    const block = blockInsideParagraph(node.current);
    if (!block) return;
    warned.current = true;
    console.warn(
      `[IDS] ${part}: it renders a <p>, which cannot hold a <${block.localName}>. Put block content in with asChild: <${part} asChild><div>…</div></${part}>.`,
    );
  });

  return useCallback((element: T | null) => mergeRefs(node, ref)(element), [ref]);
}
