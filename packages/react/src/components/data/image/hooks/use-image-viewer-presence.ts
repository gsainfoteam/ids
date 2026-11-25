'use client';

import { useCallback, useRef, useState } from 'react';

import { useInternalPresence } from '../../../../internal/overlay';

import type { ImageViewerReport, ImageViewerSurfaces } from './use-image-viewer-surfaces';
import type { ImageViewerSource } from '../parts/viewer';

export function useInternalImageViewerPresence(source: ImageViewerSource) {
  const [session, setSession] = useState(0);
  const [openedAs, setOpenedAs] = useState(source.open);
  const surfaces = useRef<ImageViewerSurfaces>({ content: null, backdrop: null, box: null });

  if (openedAs !== source.open) {
    setOpenedAs(source.open);
    if (source.open) setSession((count) => count + 1);
  }

  const presence = useInternalPresence(source.open, {
    elements: () => [surfaces.current.content, surfaces.current.backdrop, surfaces.current.box],
    onExitComplete: () => source.onExitComplete?.(),
  });

  const report = useCallback<ImageViewerReport>((surface, node) => {
    surfaces.current[surface] = node;
  }, []);

  return { session, presence, report };
}
