'use client';

import { useCallback, useEffect, useRef, type Ref, type RefCallback } from 'react';

import { mergeRefs } from '../utils';
import { isDevelopment } from '../utils/dev';

const CLOSES_A_PARAGRAPH = [
  'address',
  'article',
  'aside',
  'blockquote',
  'details',
  'dialog',
  'div',
  'dl',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'main',
  'menu',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul',
].join(',');

export function useParagraphRef<T extends HTMLElement>(
  part: string,
  ref: Ref<T> | undefined,
): RefCallback<T> {
  const node = useRef<T | null>(null);
  const warned = useRef(false);

  useEffect(() => {
    const paragraph = node.current;
    if (!isDevelopment || warned.current || paragraph?.localName !== 'p') return;
    const block = paragraph.querySelector(CLOSES_A_PARAGRAPH);
    if (!block) return;
    warned.current = true;
    console.warn(
      `[IDS] ${part}: it renders a <p>, which cannot hold a <${block.localName}>. Put block content in with asChild: <${part} asChild><div>…</div></${part}>.`,
    );
  });

  return useCallback((element: T | null) => mergeRefs(node, ref)(element), [ref]);
}
