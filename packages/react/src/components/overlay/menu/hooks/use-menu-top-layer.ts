'use client';

import { useLayoutEffect } from 'react';

import { raiseWhatStaysAboveLayers, showInTopLayer } from '../../../../internal/overlay';

export function useInternalMenuTopLayer(content: HTMLElement | null) {
  useLayoutEffect(() => {
    if (!content) return;

    showInTopLayer(content);
    raiseWhatStaysAboveLayers();
  }, [content]);
}
