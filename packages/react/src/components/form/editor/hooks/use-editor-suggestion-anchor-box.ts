'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

export function useInternalEditorSuggestionAnchorBox(
  anchor: (() => DOMRect | null) | null,
  open: boolean,
) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    const document = anchorRef.current?.parentElement;
    const rect = anchor?.();
    if (!open || !rect || !document) return;
    const origin = document.getBoundingClientRect();
    setBox({
      top: rect.top - origin.top,
      left: rect.left - origin.left,
      width: Math.max(rect.width, 1),
      height: Math.max(rect.height, 1),
    });
  }, [anchor, open]);

  return [anchorRef, box] as const;
}
