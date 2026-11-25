'use client';

import { useRef, useState, type CSSProperties } from 'react';

import { useInternalResizeObserver } from '../../../../hooks/use-resize-observer';
import { besideTheFirstLine } from '../drag-handle/geometry';

import type { HoveredBlock } from '../drag-handle/store';

export function useInternalEditorBlockHandlePlace(block: HoveredBlock | null) {
  const handleRef = useRef<HTMLButtonElement>(null);
  const [place, setPlace] = useState<CSSProperties>({});

  useInternalResizeObserver(block?.dom ?? null, (dom) => {
    const handle = handleRef.current;
    if (handle) setPlace(besideTheFirstLine(dom, handle));
  });

  return [handleRef, place] as const;
}
