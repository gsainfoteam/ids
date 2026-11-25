'use client';

import { useCallback, useRef, useState } from 'react';

export type ImageViewerSurface = 'content' | 'backdrop' | 'box';

export type ImageViewerSurfaces = Record<ImageViewerSurface, HTMLElement | null>;

export type ImageViewerReport = (surface: ImageViewerSurface, node: HTMLElement | null) => void;

export function useInternalImageViewerSurfaces(report: ImageViewerReport) {
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [backdrop, setBackdrop] = useState<HTMLElement | null>(null);
  const [area, setArea] = useState<HTMLElement | null>(null);
  const [box, setBox] = useState<HTMLElement | null>(null);
  const boxRef = useRef<HTMLElement | null>(null);

  const attachContent = useCallback(
    (node: HTMLElement | null) => {
      report('content', node);
      setContent(node);
    },
    [report],
  );
  const attachBackdrop = useCallback(
    (node: HTMLElement | null) => {
      report('backdrop', node);
      setBackdrop(node);
    },
    [report],
  );
  const attachBox = useCallback(
    (node: HTMLElement | null) => {
      boxRef.current = node;
      report('box', node);
      setBox(node);
    },
    [report],
  );

  return {
    content,
    backdrop,
    area,
    box,
    boxRef,
    attachContent,
    attachBackdrop,
    attachArea: setArea,
    attachBox,
  };
}
